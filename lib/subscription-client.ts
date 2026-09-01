import { postJson } from './api-client'

export async function initiatePaystackCheckout(payload: { plan?: string; amount?: number }) {
  return await postJson('/api/paystack/initiate', payload)
}

export async function verifyPaystackPayment(reference: string) {
  return await postJson('/api/paystack/verify', { reference })
}

export default null as unknown as typeof initiatePaystackCheckout
