import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get('code')
  const state = request.nextUrl.searchParams.get('state')

  if (!code) {
    return NextResponse.json({ ok: false, error: 'Google auth code is missing.' }, { status: 400 })
  }

  const backendBaseUrl = process.env.BACKEND_API_URL ?? 'http://localhost:5000/api/v1'
  const url = new URL(`${backendBaseUrl.replace(/\/$/, '')}/auth/google/callback`)
  url.searchParams.set('code', code)

  if (state) {
    url.searchParams.set('state', state)
  }

  try {
    const backendRes = await fetch(url, {
      method: 'GET',
      cache: 'no-store',
      credentials: 'include',
      headers: {
        accept: 'application/json',
      },
    })

    const payload = await backendRes.json().catch(() => null)

    if (!backendRes.ok) {
      const message = payload?.message ?? 'Google authentication failed.'
      return NextResponse.json({ ok: false, message }, { status: backendRes.status })
    }

    const data = payload?.data ?? payload
    const redirectUrl = new URL('/dashboard', request.url)
    const response = NextResponse.redirect(redirectUrl)

    if (data?.token) {
      response.cookies.set('blueprint_token', data.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 7,
      })
    }

    if (data?.refreshToken) {
      response.cookies.set('blueprint_refresh_token', data.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 30,
      })
    }

    return response
  } catch (error) {
    console.error('Google callback proxy failed:', error)
    return NextResponse.json({ ok: false, error: 'Failed to complete Google authentication.' }, { status: 502 })
  }
}
