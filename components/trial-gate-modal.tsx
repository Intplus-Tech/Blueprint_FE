'use client'

import React, { useId, useState, useEffect, useRef } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import { Button } from '@/components/ui/button'
import { XIcon, Clock, Lock } from 'lucide-react'
import { getBackendUrl } from '@/lib/api-client'
import { initiatePaystackCheckout } from '@/lib/subscription-client'
import getSession from '@/lib/session-client'

export interface TrialGateProps {
  feature: 'invoicing' | 'ai-review' | 'cosign'
  isActive: boolean
  onAccept: () => void
  onDismiss: () => void
  trialDaysRemaining?: number
  subscriptionRequired?: boolean
}

const featureInfo = {
  invoicing: {
    title: 'Unlock Invoicing',
    description:
      'Create and send professional invoices directly from Blueprintdoc. Your first month is free!',
    icon: '📄',
  },
  'ai-review': {
    title: 'AI Document Review',
    description:
      'Leverage Gemini AI to automatically review documents, identify risks, and get summaries of key terms.',
    icon: '🤖',
  },
  cosign: {
    title: 'Multi-Party Co-Signing',
    description: 'Invite multiple signers and manage document workflows with real-time state tracking.',
    icon: '✍️',
  },
}

/**
 * Trial/Subscription gate modal for advanced features
 * Shows when user attempts to access a feature requiring authentication
 */
export function TrialGateModal({
  feature,
  isActive,
  onAccept,
  onDismiss,
  trialDaysRemaining = 0,
  subscriptionRequired = false,
}: TrialGateProps) {
  const reduceMotion = useReducedMotion()
  const overlayId = useId()
  const info = featureInfo[feature]

  if (!isActive) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <motion.div
        role="dialog"
        aria-labelledby={overlayId}
        initial={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        className="relative w-96 max-w-[calc(100vw-2rem)] rounded-2xl border border-border bg-card p-6 text-card-foreground shadow-2xl"
      >
        {/* Close button */}
        <button
          onClick={onDismiss}
          className="absolute top-4 right-4 p-1.5 hover:bg-muted rounded-lg transition-colors"
          aria-label="Close modal"
        >
          <XIcon className="h-5 w-5" />
        </button>

        {/* Header */}
        <div className="mb-4 flex items-center gap-3">
          <span className="text-4xl">{info.icon}</span>
          <h2 id={overlayId} className="text-2xl font-bold text-brand">
            {info.title}
          </h2>
        </div>

        {/* Description */}
        <p className="mb-6 text-sm leading-relaxed text-muted-foreground">{info.description}</p>

        {/* Trial/Subscription Info */}
        <div className="mb-6 rounded-lg bg-muted p-4">
          {subscriptionRequired ? (
            <div className="flex items-start gap-3">
              <Lock className="h-5 w-5 shrink-0 text-amber-500 mt-0.5" />
              <div>
                <p className="font-semibold text-sm">Subscription Required</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Access to this feature requires an active subscription.
                </p>
              </div>
            </div>
          ) : (
            <div className="flex items-start gap-3">
              <Clock className="h-5 w-5 shrink-0 text-green-500 mt-0.5" />
              <div>
                <p className="font-semibold text-sm">{trialDaysRemaining} Days Remaining</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Trial status will update once your account is activated.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button
            onClick={onAccept}
            className="flex-1 bg-brand font-semibold text-white hover:bg-brand-hover rounded-full"
          >
            {subscriptionRequired ? 'Subscribe' : 'Sign In & Continue'}
          </Button>
          <Button onClick={onDismiss} variant="outline" className="flex-1 rounded-full font-semibold">
            Maybe Later
          </Button>
        </div>

        {/* Footer note */}
        <p className="mt-4 text-center text-xs text-muted-foreground">
          You'll be redirected to sign in with Google
        </p>
      </motion.div>
    </div>
  )
}

/**
 * Hook to manage trial gate state
 */
export function useTrialGate(feature: TrialGateProps['feature']) {
  const [isOpen, setIsOpen] = useState(false)
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [trialDaysRemaining, setTrialDaysRemaining] = useState(0)
  const [subscriptionAmount, setSubscriptionAmount] = useState<number | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  async function fetchSessionInfo() {
    try {
      const res = await fetch(getBackendUrl('/session'))
      if (!res.ok) return
      const payload = await res.json().catch(() => null)
      const data = payload?.data ?? payload
      const sub = data?.subscription ?? data

      setIsAuthenticated(Boolean(data?.user || data?.isAuthenticated))
      setIsSubscribed(Boolean(sub?.isActive || sub?.subscriptionPlan === 'premium'))
      setTrialDaysRemaining(Number(sub?.trialDaysRemaining ?? data?.trialDaysRemaining ?? 0))
      setSubscriptionAmount(sub?.subscriptionAmount ?? data?.subscriptionAmount ?? null)
    } catch (err) {
      console.error('Failed to fetch session info for trial gate:', err)
    }
  }

  async function startCheckout() {
    // Redirect users to the in-app billing page where checkout is handled
    try {
      const q = new URLSearchParams()
      if (subscriptionAmount != null) q.set('amount', String(subscriptionAmount))
      if (feature) q.set('feature', feature)
      window.location.href = `/billing?${q.toString()}`
    } catch (err) {
      console.error('Failed to open billing page:', err)
      window.location.href = '/authenticated-dashboard'
    }
  }

  // Poll the session endpoint while the gate is open. If the subscription
  // becomes active (e.g. after a successful Paystack flow), close the modal
  // automatically so users can continue without manual refresh.
  const pollRef = useRef<number | null>(null)
  useEffect(() => {
    let attempts = 0
    const maxAttempts = 40 // ~2 minutes at 3s interval

    async function poll() {
      try {
        const session = await getSession()
        const sub = (session && (session as any).subscription) ?? session
        const active = Boolean(sub && (sub.isActive || sub.subscriptionPlan === 'premium'))
        if (active) {
          setIsSubscribed(true)
          setIsOpen(false)
          return
        }
      } catch (err) {
        // ignore and retry
      }

      attempts += 1
      if (attempts < maxAttempts && isOpen) {
        pollRef.current = window.setTimeout(poll, 3000)
      }
    }

    if (isOpen) poll()
    return () => {
      if (pollRef.current) window.clearTimeout(pollRef.current)
    }
  }, [isOpen])

  return {
    isOpen,
    openGate: async () => {
      setIsOpen(true)
      await fetchSessionInfo()
    },
    closeGate: () => setIsOpen(false),
    isSubscribed,
    trialDaysRemaining,
    subscriptionAmount,
    isAuthenticated,
    startCheckout,
    setIsSubscribed,
    setTrialDaysRemaining,
  }
}
