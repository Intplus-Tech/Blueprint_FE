import { NextRequest, NextResponse } from 'next/server'
import { forwardToBackend } from '@/lib/backend'

export async function POST(request: NextRequest) {
  try {
    const hasBackend = Boolean(process.env.BACKEND_API_URL || process.env.NEXT_PUBLIC_BACKEND_API_URL)
    const body = await request.json().catch(() => undefined)

    if (!hasBackend) {
      return NextResponse.json({ error: 'Cloud provider backend not configured' }, { status: 503 })
    }

    const result = await forwardToBackend('/cloud/onedrive/connect', body, { method: 'POST' })
    return NextResponse.json({ ok: true, forwarded: result.forwarded, data: result.data })
  } catch (error) {
    console.error('OneDrive auth error:', error)
    return NextResponse.json({ error: 'Failed to connect OneDrive' }, { status: 502 })
  }
}
