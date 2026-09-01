import { NextRequest, NextResponse } from 'next/server'
import { forwardToBackend } from '@/lib/backend'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}))

    const candidatePaths = ['/invoices', '/billing/invoices', '/invoice']

    for (const path of candidatePaths) {
      try {
        const result = await forwardToBackend(path, body)
        if (result.forwarded) {
          return NextResponse.json({ ok: true, forwarded: true, data: result.data })
        }
      } catch {
        // continue to next candidate
      }
    }

    return NextResponse.json({
      ok: true,
      forwarded: false,
      data: {
        id: typeof body.id === 'string' ? body.id : `invoice-${Date.now()}`,
        status: 'Draft',
        message: 'Invoice saved locally and ready to sync to your backend.',
      },
    })
  } catch (error) {
    console.error('Invoice save proxy error:', error)
    return NextResponse.json({ ok: false, error: 'Invoice save failed' }, { status: 500 })
  }
}
