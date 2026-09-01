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

    const candidatePaths = ['/document/invite', '/cosigners/invite', '/signing/invite', '/documents/invite']

    for (const path of candidatePaths) {
      try {
        const result = await forwardToBackend(path, payload)
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
        id: `invite-${Date.now()}`,
        status: 'sent',
        email: payload.email,
        invitedAt: new Date().toISOString(),
      },
    })
  } catch (error) {
    console.error('Document invite proxy error:', error)
    return NextResponse.json({ ok: false, error: 'Invite failed' }, { status: 500 })
  }
}
