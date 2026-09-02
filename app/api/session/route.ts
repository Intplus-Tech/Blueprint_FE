import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const backendBase = (process.env.BACKEND_API_URL ?? 'http://localhost:5000/api/v1').replace(/\/api\/v1\/?$/, '')
    const url = new URL('/api/session', backendBase)

    Object.entries(Object.fromEntries(request.nextUrl.searchParams.entries())).forEach(([key, value]) => {
      url.searchParams.set(key, value)
    })

    const backendRes = await fetch(url, {
      method: 'GET',
      headers: { accept: 'application/json' },
      cache: 'no-store',
      credentials: 'include',
    })

    const payload = await backendRes.json().catch(() => null)

    if (!backendRes.ok) {
      return NextResponse.json({ ok: false, error: payload?.message ?? 'Failed to fetch session' }, { status: backendRes.status })
    }

    return NextResponse.json({ ok: true, forwarded: true, data: payload })
  } catch (err) {
    console.error('Session proxy error:', err)
    return NextResponse.json({ ok: false, error: 'Failed to fetch session' }, { status: 502 })
  }
}
