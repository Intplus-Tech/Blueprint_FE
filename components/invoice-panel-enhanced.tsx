'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Plus, Clock, CheckCircle, AlertCircle } from 'lucide-react'
import { useSubscriptionStatus, getTrialExpirationStatus } from '@/lib/use-subscription'
import { initiatePaystackCheckout } from '@/lib/subscription-client'
import type { Invoice } from '@/lib/invoice-types'

function unwrapPaystackPayload(response: unknown) {
  if (!response || typeof response !== 'object') return null

  const source = 'data' in response && response.data && typeof response.data === 'object'
    ? (response.data as Record<string, unknown>)
    : (response as Record<string, unknown>)

  if (source && 'data' in source && source.data && typeof source.data === 'object') {
    return source.data as Record<string, unknown>
  }

  return source
}

function getPaystackRedirectUrl(response: unknown) {
  const payload = unwrapPaystackPayload(response)
  if (!payload || typeof payload !== 'object') return null

  const url = payload.authorizationUrl ?? payload.authorization_url ?? payload.checkoutUrl ?? payload.checkout_url
  return typeof url === 'string' && url.trim() ? url : null
}

function getPaystackReference(response: unknown) {
  const payload = unwrapPaystackPayload(response)
  if (!payload || typeof payload !== 'object') return null

  const ref = payload.reference ?? payload.paymentReference
  return typeof ref === 'string' && ref.trim() ? ref : null
}

export interface InvoicePanelHeaderProps {
  onNewInvoice?: () => void
}

/**
 * Enhanced invoice panel header with subscription/trial status
 */
export function InvoicePanelHeader({ onNewInvoice }: InvoicePanelHeaderProps) {
  const subscription = useSubscriptionStatus()

  if (!subscription.isAuthenticated) {
    return (
      <div className="rounded-lg bg-blue-50 border border-blue-200 p-4 text-sm text-blue-900">
        <p className="font-semibold mb-2">Sign in to Access Invoicing</p>
        <p className="text-xs opacity-90">
          Create and manage professional invoices with a 30-day free trial after signing in.
        </p>
      </div>
    )
  }

  const trialStatus = getTrialExpirationStatus(subscription.trialDaysRemaining)

  return (
    <div className="space-y-4">
      {/* Trial/Subscription Status */}
      {subscription.isTrialActive && (
        <div
          className={`rounded-lg border p-4 space-y-2 ${
            trialStatus === 'expiring-soon'
              ? 'bg-amber-50 border-amber-200'
              : 'bg-green-50 border-green-200'
          }`}
        >
          <div className="flex items-start gap-3">
            {trialStatus === 'expiring-soon' ? (
              <AlertCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
            ) : (
              <Clock className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
            )}
            <div>
              <p
                className={`font-semibold text-sm ${
                  trialStatus === 'expiring-soon'
                    ? 'text-amber-900'
                    : 'text-green-900'
                }`}
              >
                {subscription.trialDaysRemaining} Days Free Trial Remaining
              </p>
              <p
                className={`text-xs mt-1 ${
                  trialStatus === 'expiring-soon'
                    ? 'text-amber-800'
                    : 'text-green-800'
                }`}
              >
                After your trial, continue with ₦{subscription.subscriptionAmount}/month
              </p>
            </div>
          </div>
        </div>
      )}

      {!subscription.isTrialActive && subscription.subscriptionPlan === 'premium' && (
        <div className="rounded-lg bg-green-50 border border-green-200 p-4 space-y-2">
          <div className="flex items-start gap-3">
            <CheckCircle className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-sm text-green-900">Premium Subscription Active</p>
              <p className="text-xs text-green-800 mt-1">
                You're all set! Create unlimited invoices with our premium features.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* New Invoice Button */}
      {subscription.isActive && (
        <div className="flex gap-2">
          <Button
            onClick={onNewInvoice}
            className="flex-1 bg-brand text-white font-semibold rounded-full hover:bg-brand-hover flex items-center justify-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Create New Invoice
          </Button>
          {/* Upgrade / Subscribe button */}
          {!subscription.isTrialActive && subscription.subscriptionPlan !== 'premium' && (
            <Button
              onClick={async () => {
                const res = await initiatePaystackCheckout({ plan: 'monthly', amount: subscription.subscriptionAmount ?? 2000 })
                const redirectUrl = getPaystackRedirectUrl(res)

                if (redirectUrl) {
                  window.location.href = redirectUrl
                  return
                }

                const reference = getPaystackReference(res)
                if (reference) {
                  window.location.href = `/authenticated-dashboard?reference=${encodeURIComponent(reference)}`
                  return
                }

                window.location.href = '/authenticated-dashboard'
              }}
              variant="outline"
              className="px-3"
            >
              ₦{subscription.subscriptionAmount}/mo
            </Button>
          )}
        </div>
      )}
    </div>
  )
}

/**
 * Invoice list with export and filtering
 */
export interface InvoiceListProps {
  invoices: Invoice[]
  onSelectInvoice?: (invoice: Invoice) => void
  onDeleteInvoice?: (id: string) => void
}

export function InvoiceList({ invoices, onSelectInvoice, onDeleteInvoice }: InvoiceListProps) {
  if (invoices.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <p className="text-muted-foreground text-sm mb-4">No invoices yet</p>
        <p className="text-xs text-muted-foreground">
          Create your first invoice to get started with professional billing.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {invoices.map((invoice) => (
        <div
          key={invoice.id}
          className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-muted cursor-pointer transition-colors"
          onClick={() => onSelectInvoice?.(invoice)}
        >
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm text-card-foreground truncate">
              INV-{invoice.invoiceNumber}
            </p>
            <p className="text-xs text-muted-foreground">
              {invoice.billTo} • {invoice.issueDate}
            </p>
          </div>
          <div className="text-right ml-4">
            <p className="font-semibold text-sm">₦{invoice.items.reduce((sum, item) => sum + item.qty * item.rate, 0).toLocaleString()}</p>
            <span
              className={`text-xs font-medium px-2 py-1 rounded-full ${
                invoice.status === 'Draft'
                  ? 'bg-gray-100 text-gray-700'
                  : invoice.status === 'Sent'
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-emerald-100 text-emerald-700'
              }`}
            >
              {invoice.status}
            </span>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation()
              onDeleteInvoice?.(invoice.id)
            }}
            className="ml-2 text-muted-foreground hover:text-destructive transition-colors"
            aria-label="Delete invoice"
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  )
}
