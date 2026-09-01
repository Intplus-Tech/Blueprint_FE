'use client'

import { useEffect, useState } from 'react'

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

const DEFAULT_TRIAL_DAYS = 0

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
        const res = await fetch('/api/session')
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
        // backend proxy returns { ok, forwarded, data }
        const data = payload?.data ?? payload

        // Try to locate subscription info in the session payload
        const sub = data?.subscription ?? data

        const subscriptionStatus: SubscriptionStatus = {
          isAuthenticated: Boolean(data?.user || data?.isAuthenticated),
          isActive: Boolean(sub?.isActive ?? data?.isActive ?? false),
          isTrialActive: Boolean(sub?.isTrialActive ?? data?.isTrialActive ?? false),
          trialDaysRemaining: Number(sub?.trialDaysRemaining ?? data?.trialDaysRemaining ?? DEFAULT_TRIAL_DAYS),
          trialStartDate: sub?.trialStartDate ? new Date(sub.trialStartDate) : undefined,
          trialEndDate: sub?.trialEndDate ? new Date(sub.trialEndDate) : undefined,
          subscriptionPlan: sub?.subscriptionPlan ?? data?.subscriptionPlan,
          subscriptionAmount: sub?.subscriptionAmount ?? data?.subscriptionAmount,
          subscriptionCurrency: sub?.subscriptionCurrency ?? data?.subscriptionCurrency,
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

  // Invoicing requires active trial or subscription
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
