import { NextRequest, NextResponse } from 'next/server'
import { forwardToBackend } from '@/lib/backend'

export async function POST(request: NextRequest) {
  try {
    const hasBackend = Boolean(process.env.BACKEND_API_URL || process.env.NEXT_PUBLIC_BACKEND_API_URL)
    const body = await request.json().catch(() => undefined)

    if (!hasBackend) {
      return NextResponse.json({ error: 'Cloud provider backend not configured' }, { status: 503 })
    }

    const result = await forwardToBackend('/cloud/drive/connect', body, { method: 'POST' })
    return NextResponse.json({ ok: true, forwarded: result.forwarded, data: result.data })
  } catch (error) {
    console.error('Google Drive auth error:', error)
    return NextResponse.json({ error: 'Failed to connect Google Drive' }, { status: 502 })
  }
}
