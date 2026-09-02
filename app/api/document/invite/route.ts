import { NextRequest, NextResponse } from 'next/server'
import { forwardToBackend } from '@/lib/backend'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}))
    const payload = {
      firstName: typeof body.firstName === 'string' ? body.firstName : '',
      lastName: typeof body.lastName === 'string' ? body.lastName : '',
      email: typeof body.email === 'string' ? body.email : '',
      documentId: typeof body.documentId === 'string' ? body.documentId : undefined,
      role: typeof body.role === 'string' ? body.role : 'signer',
    }

    const exactPaths = ['/document/invite', '/cosigners/invite', '/signing/invite']

    const hasBackend = Boolean(process.env.BACKEND_API_URL || process.env.NEXT_PUBLIC_BACKEND_API_URL)

    if (!hasBackend) {
      return NextResponse.json({ error: 'Backend not configured for invite' }, { status: 503 })
    }

    for (const path of exactPaths) {
      try {
        const result = await forwardToBackend(path, payload)
        if (result.forwarded) {
          return NextResponse.json({ ok: true, forwarded: true, data: result.data })
        }
      } catch {
        // continue to next exact route
      }
    }

    return NextResponse.json({ error: 'Failed to forward invite to backend' }, { status: 502 })
  } catch (error) {
    console.error('Document invite proxy error:', error)
    return NextResponse.json({ ok: false, error: 'Invite failed' }, { status: 500 })
  }
}
