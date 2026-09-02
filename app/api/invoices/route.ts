import { NextRequest, NextResponse } from 'next/server'
import { forwardToBackend } from '@/lib/backend'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}))

    const exactPaths = ['/invoices', '/invoice']

    const hasBackend = Boolean(process.env.BACKEND_API_URL || process.env.NEXT_PUBLIC_BACKEND_API_URL)

    if (!hasBackend) {
      return NextResponse.json({ error: 'Backend not configured for invoices' }, { status: 503 })
    }

    for (const path of exactPaths) {
      try {
        const result = await forwardToBackend(path, body)
        if (result.forwarded) {
          return NextResponse.json({ ok: true, forwarded: true, data: result.data })
        }
      } catch {
        // continue to next exact route
      }
    }

    return NextResponse.json({ error: 'Failed to forward invoice to backend' }, { status: 502 })
  } catch (error) {
    console.error('Invoice save proxy error:', error)
    return NextResponse.json({ ok: false, error: 'Invoice save failed' }, { status: 500 })
  }
}
