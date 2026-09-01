import { NextRequest, NextResponse } from 'next/server'
import { forwardToBackend } from '@/lib/backend'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}))
    const basePath = '/paystack/initiate'
    // Forward to backend (which should have Paystack secret handling)
    const result = await forwardToBackend(basePath, body)
    return NextResponse.json({ ok: true, forwarded: result.forwarded, data: result.data })
  } catch (err) {
    console.error('Paystack initiate proxy error:', err)
    return NextResponse.json({ ok: false, error: 'Failed to initiate' }, { status: 500 })
  }
}
