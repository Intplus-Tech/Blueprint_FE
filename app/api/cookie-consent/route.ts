import { NextResponse } from 'next/server'
import { cookieConsentSchema } from '@/lib/schemas'

/**
 * Cookie consent is intentionally a no-op on the frontend.
 * The backend owns this state and the browser does not persist consent.
 */
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

  return NextResponse.json({
    ok: true,
    noop: true,
    forwarded: false,
    data: parsed.data,
    message:
      'Cookie consent is intentionally a no-op on the frontend; the backend owns consent state without browser persistence.',
  })
}
