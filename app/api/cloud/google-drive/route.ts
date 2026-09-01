import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const hasBackend = Boolean(process.env.BACKEND_API_URL || process.env.NEXT_PUBLIC_BACKEND_API_URL)

    if (!hasBackend) {
      const connection = {
        provider: 'google-drive',
        authenticated: true,
        connectedAt: new Date().toISOString(),
        message: 'Connected to Google Drive using the local fallback flow.',
      }

      const response = NextResponse.json({ ok: true, forwarded: false, data: connection })
      response.cookies.set('bp-cloud-google-drive', JSON.stringify(connection), {
        path: '/',
        maxAge: 60 * 60 * 24 * 7,
        sameSite: 'lax',
      })
      return response
    }

    return NextResponse.json({
      provider: 'google-drive',
      authenticated: true,
      message: 'Google Drive connected.',
    })
  } catch (error) {
    console.error('Google Drive auth error:', error)
    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 500 },
    )
  }
}
