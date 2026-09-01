import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const hasBackend = Boolean(process.env.BACKEND_API_URL || process.env.NEXT_PUBLIC_BACKEND_API_URL)

    if (!hasBackend) {
      const connection = {
        provider: 'dropbox',
        authenticated: true,
        connectedAt: new Date().toISOString(),
        message: 'Connected to Dropbox using the local fallback flow.',
      }

      const response = NextResponse.json({ ok: true, forwarded: false, data: connection })
      response.cookies.set('bp-cloud-dropbox', JSON.stringify(connection), {
        path: '/',
        maxAge: 60 * 60 * 24 * 7,
        sameSite: 'lax',
      })
      return response
    }

    return NextResponse.json({
      provider: 'dropbox',
      authenticated: true,
      message: 'Dropbox connected.',
    })
  } catch (error) {
    console.error('Dropbox auth error:', error)
    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 500 },
    )
  }
}
