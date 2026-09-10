import { Suspense } from 'react'
import BillingClient from './billing-client'

export default function BillingPage() {
  return (
    <Suspense fallback={<div className="p-6">Loading billing...</div>}>
      <BillingClient />
    </Suspense>
  )
}
