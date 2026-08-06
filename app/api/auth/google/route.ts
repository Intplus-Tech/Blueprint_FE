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

  try {
    const result = await forwardToBackend('/auth/google', parsed.data)
    return NextResponse.json(result, { status: 200 })
  } catch {
    return NextResponse.json({ error: 'Sign-in failed' }, { status: 502 })
  }
}
