import { NextRequest, NextResponse } from 'next/server'
import { forwardToBackend } from '@/lib/backend'

export async function GET(request: NextRequest) {
  try {
    const result = await forwardToBackend('/session', undefined, {
      method: 'GET',
      query: Object.fromEntries(request.nextUrl.searchParams.entries()),
    })
    return NextResponse.json({ ok: true, forwarded: result.forwarded, data: result.data })
  } catch (err) {
    console.error('Session proxy error:', err)
    return NextResponse.json({ ok: false, error: 'Failed to fetch session' }, { status: 502 })
  }
}
