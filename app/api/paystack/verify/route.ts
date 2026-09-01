import { NextRequest, NextResponse } from 'next/server'
import { forwardToBackend } from '@/lib/backend'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}))
    const basePath = '/paystack/verify'
    const result = await forwardToBackend(basePath, body)
    return NextResponse.json({ ok: true, forwarded: result.forwarded, data: result.data })
  } catch (err) {
    console.error('Paystack verify proxy error:', err)
    return NextResponse.json({ ok: false, error: 'Verification failed' }, { status: 500 })
  }
}
