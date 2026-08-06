import { NextResponse } from 'next/server'
import { uploadSchema } from '@/lib/schemas'
import { forwardToBackend } from '@/lib/backend'

export async function POST(request: Request) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const parsed = uploadSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation failed', issues: parsed.error.flatten() },
      { status: 422 },
    )
  }

  try {
    const result = await forwardToBackend('/uploads', parsed.data)
    return NextResponse.json(result, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Failed to register upload' }, { status: 502 })
  }
}
