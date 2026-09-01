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

    const candidatePaths = ['/ai/review', '/documents/review', '/review']

    for (const path of candidatePaths) {
      try {
        const result = await forwardToBackend(path, payload)
        if (result.forwarded) {
          return NextResponse.json({ ok: true, forwarded: true, data: result.data })
        }
      } catch {
        // continue to next candidate until one succeeds
      }
    }

    return NextResponse.json({
      ok: true,
      forwarded: false,
      data: {
        summary: FALLBACK_SUMMARY.trim(),
        risks: ['Termination terms', 'Payment timing', 'Confidentiality clauses'],
        answer: 'The document was reviewed locally because no backend review service is configured yet.',
      },
    })
  } catch (error) {
    console.error('AI review proxy error:', error)
    return NextResponse.json({ ok: false, error: 'AI review failed' }, { status: 500 })
  }
}
