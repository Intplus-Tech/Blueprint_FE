import { NextResponse } from 'next/server'
import { cookieConsentSchema } from '@/lib/schemas'
import { forwardToBackend } from '@/lib/backend'

export async function POST(request: Request) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const parsed = cookieConsentSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation failed', issues: parsed.error.flatten() },
      { status: 422 },
    )
  }

  const createLocalResponse = () => {
    const response = NextResponse.json({
      ok: true,
      forwarded: false,
      data: parsed.data,
      mode: 'local-fallback',
    })

    response.cookies.set('bp-cookie-consent', JSON.stringify(parsed.data), {
      path: '/',
      maxAge: 60 * 60 * 24 * 30,
      sameSite: 'lax',
    })

    return response
  }

  const hasBackend = Boolean(process.env.BACKEND_API_URL || process.env.NEXT_PUBLIC_BACKEND_API_URL)

  if (!hasBackend) {
    return createLocalResponse()
  }

  try {
    const result = await forwardToBackend('/cookie-consent', parsed.data)
    const response = NextResponse.json({
      ok: true,
      forwarded: true,
      data: result.data ?? parsed.data,
    })

    response.cookies.set('bp-cookie-consent', JSON.stringify(parsed.data), {
      path: '/',
      maxAge: 60 * 60 * 24 * 30,
      sameSite: 'lax',
    })

    return response
  } catch (error) {
    console.error('Cookie consent backend proxy failed:', error)
    return createLocalResponse()
  }
}
