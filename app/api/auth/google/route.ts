import { NextResponse } from 'next/server'
import { forwardToBackend } from '@/lib/backend'

export async function GET(request: Request) {
  const hasBackend = Boolean(process.env.BACKEND_API_URL || process.env.NEXT_PUBLIC_BACKEND_API_URL)

  if (!hasBackend) {
    return NextResponse.json({ error: 'Auth backend not configured' }, { status: 503 })
  }

  const url = new URL(request.url)
  const code = url.searchParams.get('code')

  if (!code) {
    return NextResponse.json({ error: 'Google auth code is required' }, { status: 400 })
  }

  try {
    const result = await forwardToBackend('/auth/google/callback', undefined, {
      method: 'GET',
      query: { code },
    })
    return NextResponse.json({ ok: true, forwarded: result.forwarded, data: result.data })
  } catch (error) {
    console.error('Google callback proxy failed:', error)
    return NextResponse.json({ error: 'Failed to reach auth backend' }, { status: 502 })
  }
}

export async function POST(request: Request) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const code = typeof body === 'object' && body && 'code' in body ? String((body as { code?: string }).code) : ''

  if (!code) {
    return NextResponse.json({ error: 'Google auth code is required' }, { status: 400 })
  }

  const hasBackend = Boolean(process.env.BACKEND_API_URL || process.env.NEXT_PUBLIC_BACKEND_API_URL)

  if (!hasBackend) {
    return NextResponse.json({ error: 'Auth backend not configured' }, { status: 503 })
  }

  try {
    const result = await forwardToBackend('/auth/google/callback', undefined, {
      method: 'GET',
      query: { code },
    })
    return NextResponse.json({ ok: true, forwarded: result.forwarded, data: result.data })
  } catch (error) {
    console.error('Google auth backend proxy failed:', error)
    return NextResponse.json({ error: 'Failed to reach auth backend' }, { status: 502 })
  }
}
