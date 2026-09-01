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

    const fallbackPath = '/dashboard?google=success'
    return NextResponse.json({
      ok: true,
      forwarded: false,
      data: {
        authUrl: fallbackPath,
        provider: 'google',
        mode: 'local-fallback',
      },
    })
  } catch (err) {
    console.error('Auth/google/url proxy error:', err)
    return NextResponse.json({ ok: true, forwarded: false, data: { authUrl: '/dashboard?google=success', provider: 'google', mode: 'local-fallback' } })
  }
}
