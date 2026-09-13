'use client'

import { useEffect, useState } from 'react'
import { getBackendUrl } from '@/lib/api-client'

export interface SubscriptionStatus {
  isAuthenticated: boolean
  isActive: boolean
  isTrialActive: boolean
  trialDaysRemaining: number
  trialStartDate?: Date
  trialEndDate?: Date
  subscriptionPlan?: 'free' | 'premium'
  subscriptionAmount?: number // in Naira
  subscriptionCurrency?: string
}

const DEFAULT_TRIAL_DAYS = 30
const INVOICE_TRIAL_STORAGE_KEY = 'blueprint_invoice_trial_started_at'
const DEFAULT_SUBSCRIPTION_AMOUNT = 2000

function readFrontendTrialStart(): Date | null {
  if (typeof window === 'undefined') return null

  const stored = window.localStorage.getItem(INVOICE_TRIAL_STORAGE_KEY)
  if (!stored) return null

  const parsed = new Date(stored)
  return Number.isNaN(parsed.getTime()) ? null : parsed
}

function ensureFrontendTrialStart(): Date {
  if (typeof window === 'undefined') return new Date()

  const existing = readFrontendTrialStart()
  if (existing) return existing

  const start = new Date()
  window.localStorage.setItem(INVOICE_TRIAL_STORAGE_KEY, start.toISOString())
  return start
}

export function resolveFrontendInvoiceTrial(data: Record<string, unknown> | null | undefined): SubscriptionStatus | null {
  if (!data || typeof data !== 'object') return null

  const userExists = Boolean((data as Record<string, unknown>).user || (data as Record<string, unknown>).isAuthenticated)
  if (!userExists) {
    return {
      isAuthenticated: false,
      isActive: false,
      isTrialActive: false,
      trialDaysRemaining: 0,
    }
  }

  const sub = (data as Record<string, unknown>).subscription && typeof (data as Record<string, unknown>).subscription === 'object'
    ? ((data as Record<string, unknown>).subscription as Record<string, unknown>)
    : data

  const explicitTrialDays = Number(sub?.trialDaysRemaining ?? data?.trialDaysRemaining ?? 0)
  const explicitIsTrialActive = Boolean(sub?.isTrialActive ?? data?.isTrialActive ?? false)
  const explicitIsActive = Boolean(sub?.isActive ?? data?.isActive ?? false)
  const explicitPlan = (sub?.subscriptionPlan ?? data?.subscriptionPlan) as 'free' | 'premium' | undefined

  if (explicitPlan === 'premium' || explicitIsActive || explicitIsTrialActive || explicitTrialDays > 0) {
    return {
      isAuthenticated: true,
      isActive: explicitIsActive || explicitPlan === 'premium' || explicitIsTrialActive || explicitTrialDays > 0,
      isTrialActive: explicitIsTrialActive || explicitTrialDays > 0,
      trialDaysRemaining: explicitTrialDays > 0 ? explicitTrialDays : 0,
      trialStartDate: sub?.trialStartDate ? new Date(String(sub.trialStartDate)) : undefined,
      trialEndDate: sub?.trialEndDate ? new Date(String(sub.trialEndDate)) : undefined,
      subscriptionPlan: explicitPlan === 'premium' ? 'premium' : 'free',
      subscriptionAmount: Number(sub?.subscriptionAmount ?? data?.subscriptionAmount ?? DEFAULT_SUBSCRIPTION_AMOUNT),
      subscriptionCurrency: (sub?.subscriptionCurrency ?? data?.subscriptionCurrency ?? 'NGN') as string,
    }
  }

  const trialStart = ensureFrontendTrialStart()
  const elapsedDays = Math.max(0, Math.floor((Date.now() - trialStart.getTime()) / (1000 * 60 * 60 * 24)))
  const trialDaysRemaining = Math.max(0, DEFAULT_TRIAL_DAYS - elapsedDays)

  return {
    isAuthenticated: true,
    isActive: trialDaysRemaining > 0,
    isTrialActive: trialDaysRemaining > 0,
    trialDaysRemaining,
    trialStartDate: trialStart,
    trialEndDate: new Date(trialStart.getTime() + DEFAULT_TRIAL_DAYS * 24 * 60 * 60 * 1000),
    subscriptionPlan: 'free',
    subscriptionAmount: DEFAULT_SUBSCRIPTION_AMOUNT,
    subscriptionCurrency: 'NGN',
  }
}

/**
 * Hook to manage subscription and trial status.
 */
export function useSubscriptionStatus(): SubscriptionStatus {
  const [status, setStatus] = useState<SubscriptionStatus>({
    isAuthenticated: false,
    isActive: false,
    isTrialActive: false,
    trialDaysRemaining: 0,
  })

  useEffect(() => {
    let cancelled = false

    async function fetchSubscriptionStatus() {
      try {
        const res = await fetch(getBackendUrl('/session'))
        if (!res.ok) {
          if (!cancelled) {
            setStatus({
              isAuthenticated: false,
              isActive: false,
              isTrialActive: false,
              trialDaysRemaining: 0,
            })
          }
          return
        }

        const payload = await res.json().catch(() => null)
        const data = payload?.data ?? payload
        const frontendSubscription = resolveFrontendInvoiceTrial(data)
        const subscriptionStatus: SubscriptionStatus = frontendSubscription ?? {
          isAuthenticated: false,
          isActive: false,
          isTrialActive: false,
          trialDaysRemaining: 0,
        }

        if (!cancelled) setStatus(subscriptionStatus)
      } catch (err) {
        console.error('Failed to fetch subscription status:', err)
        if (!cancelled) {
          setStatus({
            isAuthenticated: false,
            isActive: false,
            isTrialActive: false,
            trialDaysRemaining: 0,
          })
        }
      }
    }

    void fetchSubscriptionStatus()

    return () => {
      cancelled = true
    }
  }, [])

  return status
}

/**
 * Check if a feature is available based on subscription status
 */
export function isFeatureAvailable(
  feature: 'invoicing' | 'ai-review' | 'cosign',
  subscriptionStatus: SubscriptionStatus,
): boolean {
  if (!subscriptionStatus.isAuthenticated) {
    return false
  }

  // Free features available to all authenticated users
  if (feature === 'cosign' || feature === 'ai-review') {
    return true
  }

  // Invoicing includes a 30-day free trial for new sign-ins before the ₦2,000 Paystack plan kicks in.
  if (feature === 'invoicing') {
    return subscriptionStatus.isActive && (subscriptionStatus.isTrialActive || subscriptionStatus.subscriptionPlan === 'premium')
  }

  return false
}

/**
 * Get trial expiration status
 */
export function getTrialExpirationStatus(trialDaysRemaining: number): 'active' | 'expiring-soon' | 'expired' {
  if (trialDaysRemaining <= 0) return 'expired'
  if (trialDaysRemaining <= 3) return 'expiring-soon'
  return 'active'
}
