"use client"

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { initiatePaystackCheckout, verifyPaystackPayment } from '@/lib/subscription-client'
import { Button } from '@/components/ui/button'
import { getSession } from '@/lib/session-client'

export default function BillingClient() {
  const search = useSearchParams()
  const feature = search.get('feature') ?? 'invoicing'
  const amountParam = search.get('amount')
  const amount = amountParam ? Number(amountParam) : null

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {}, [feature])

  // If Paystack redirects back with a `reference` query param, verify it
  useEffect(() => {
    const ref = search.get('reference')
    if (!ref) return

    let mounted = true
    ;(async () => {
      setLoading(true)
      setError(null)
      try {
        const res = await verifyPaystackPayment(ref)
        // Optionally inspect res for success
        // Refresh session so frontend sees updated subscription state
        if (mounted) {
          await getSession()
          // redirect to dashboard with success flag
          window.location.href = '/dashboard?payment=success'
        }
      } catch (err: any) {
        console.error('Verification failed', err)
        if (mounted) setError(err?.message ?? 'Verification failed')
      } finally {
        if (mounted) setLoading(false)
      }
    })()

    return () => {
      mounted = false
    }
  }, [search])

  async function handleCheckout() {
    setError(null)
    setLoading(true)
    try {
      const res = await initiatePaystackCheckout({ plan: 'monthly', amount: amount ?? 2000 })
      const payload = (res && (res as any).data) || res
      const redirectUrl = payload?.authorizationUrl ?? payload?.authorization_url ?? payload?.checkoutUrl ?? payload?.checkout_url
      if (typeof redirectUrl === 'string' && redirectUrl.trim()) {
        window.location.href = redirectUrl
        return
      }
      const reference = payload?.reference ?? payload?.paymentReference
      if (typeof reference === 'string' && reference.trim()) {
        window.location.href = `/dashboard?reference=${encodeURIComponent(reference)}`
        return
      }
      window.location.href = '/dashboard'
    } catch (err: any) {
      console.error('Checkout failed', err)
      setError(err?.message ?? 'Checkout failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-md rounded-lg border bg-white p-6 shadow-sm">
        <h1 className="text-lg font-semibold">Activate subscription</h1>
        <p className="mt-2 text-sm text-gray-600">Feature: {feature}</p>
        <p className="mt-2 text-sm text-gray-700">Amount: {amount ? `₦${amount}` : 'Calculated at checkout'}</p>

        {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

        <div className="mt-6">
          <Button onClick={handleCheckout} disabled={loading} className="w-full">
            {loading ? 'Starting checkout...' : `Subscribe ${amount ? `₦${amount}` : ''}`}
          </Button>
        </div>
      </div>
    </div>
  )
}
