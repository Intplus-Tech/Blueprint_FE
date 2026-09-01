import { NextResponse } from 'next/server'
import { googleAuthSchema } from '@/lib/schemas'
import { forwardToBackend } from '@/lib/backend'

export async function POST(request: Request) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const parsed = googleAuthSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation failed', issues: parsed.error.flatten() },
      { status: 422 },
    )
  }

  const createLocalResponse = () => {
    const user = {
      id: 'local-google-user',
      name: parsed.data.name,
      email: parsed.data.email,
      provider: 'google',
      authenticated: true,
      createdAt: new Date().toISOString(),
    }

    const response = NextResponse.json({
      ok: true,
      forwarded: false,
      data: { user, authenticated: true },
      mode: 'local-fallback',
    })

    response.cookies.set('bp-google-auth', JSON.stringify(user), {
      httpOnly: true,
      path: '/',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
    })

    return response
  }

  const hasBackend = Boolean(process.env.BACKEND_API_URL || process.env.NEXT_PUBLIC_BACKEND_API_URL)

  if (!hasBackend) {
    return createLocalResponse()
  }

  try {
    const result = await forwardToBackend('/auth/google', parsed.data)
    return NextResponse.json(result, { status: 200 })
  } catch (error) {
    console.error('Google auth backend proxy failed:', error)
    return createLocalResponse()
  }
}
