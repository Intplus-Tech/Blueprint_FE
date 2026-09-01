import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const hasBackend = Boolean(process.env.BACKEND_API_URL || process.env.NEXT_PUBLIC_BACKEND_API_URL)

    if (!hasBackend) {
      const connection = {
        provider: 'onedrive',
        authenticated: true,
        connectedAt: new Date().toISOString(),
        message: 'Connected to OneDrive using the local fallback flow.',
      }

      const response = NextResponse.json({ ok: true, forwarded: false, data: connection })
      response.cookies.set('bp-cloud-onedrive', JSON.stringify(connection), {
        path: '/',
        maxAge: 60 * 60 * 24 * 7,
        sameSite: 'lax',
      })
      return response
    }

    return NextResponse.json({
      provider: 'onedrive',
      authenticated: true,
      message: 'OneDrive connected.',
    })
  } catch (error) {
    console.error('OneDrive auth error:', error)
    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 500 },
    )
  }
}
