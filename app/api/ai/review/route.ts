import { NextRequest, NextResponse } from 'next/server'
import { forwardToBackend } from '@/lib/backend'

const FALLBACK_SUMMARY = `
This document appears to be a standard commercial agreement with defined responsibilities, dates, and signatory obligations.
Risks to check: termination language, payment timing, indemnity scope, and any confidentiality obligations.
Key items: confirm value, responsibilities, approval conditions, and expected delivery dates before signing.
`

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}))
    const payload = {
      prompt: typeof body.prompt === 'string' ? body.prompt : 'Summarize this document',
      documentText: typeof body.documentText === 'string' ? body.documentText : '',
    }

    const exactPath = '/ai/review'

    try {
      const result = await forwardToBackend(exactPath, payload)
      if (result.forwarded) {
        return NextResponse.json({ ok: true, forwarded: true, data: result.data })
      }
    } catch {
      // backend route is valid but currently unavailable
    }

    return NextResponse.json({ error: 'AI review service unavailable' }, { status: 503 })
  } catch (error) {
    console.error('AI review proxy error:', error)
    return NextResponse.json({ ok: false, error: 'AI review failed' }, { status: 502 })
  }
}
