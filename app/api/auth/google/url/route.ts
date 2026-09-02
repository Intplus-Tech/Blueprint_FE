import { NextRequest, NextResponse } from 'next/server'
import { forwardToBackend } from '@/lib/backend'

export async function GET(request: NextRequest) {
  try {
    const hasBackend = Boolean(process.env.BACKEND_API_URL || process.env.NEXT_PUBLIC_BACKEND_API_URL)

    if (hasBackend) {
      const result = await forwardToBackend('/auth/google/auth-url', undefined, {
        method: 'GET',
        query: Object.fromEntries(request.nextUrl.searchParams.entries()),
      })
      return NextResponse.json({ ok: true, forwarded: result.forwarded, data: result.data })
    }
    return NextResponse.json({ error: 'Auth backend not configured' }, { status: 503 })
  } catch (err) {
    console.error('Auth/google/url proxy error:', err)
    return NextResponse.json({ error: 'Failed to reach auth backend' }, { status: 502 })
  }
}
