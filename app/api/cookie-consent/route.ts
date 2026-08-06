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

  try {
    const result = await forwardToBackend('/cookie-consent', parsed.data)
    return NextResponse.json(result, { status: 200 })
  } catch {
    return NextResponse.json({ error: 'Failed to save preferences' }, { status: 502 })
  }
}
