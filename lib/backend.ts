import 'server-only'

export type BackendRequestOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  headers?: Record<string, string>
  query?: Record<string, string | number | boolean | undefined>
  body?: unknown
}

export function getBearerTokenFromHeaders(headers: Headers | undefined | null): string | null {
  const authorization = headers?.get('authorization') ?? ''
  if (authorization.toLowerCase().startsWith('bearer ')) {
    return authorization.slice(7).trim()
  }

  const cookieHeader = headers?.get('cookie') ?? ''
  const cookiePairs = cookieHeader.split(';').map((pair) => pair.trim()).filter(Boolean)

  for (const pair of cookiePairs) {
    const separatorIndex = pair.indexOf('=')
    const name = separatorIndex >= 0 ? pair.slice(0, separatorIndex).trim() : pair.trim()
    const value = separatorIndex >= 0 ? pair.slice(separatorIndex + 1).trim() : ''

    if (['blueprint_token', 'token', 'auth_token', 'jwt'].includes(name)) {
      return decodeURIComponent(value)
    }
  }

  return null
}

export function getAuthHeadersForRequest(request: Request | Headers | undefined | null): Record<string, string> {
  const headers = request instanceof Headers ? request : request ? new Headers(request.headers) : new Headers()
  const token = getBearerTokenFromHeaders(headers)

  return token ? { authorization: `Bearer ${token}` } : {}
}

export async function forwardToBackend<T>(
  path: string,
  payload?: T,
  options: BackendRequestOptions = {},
): Promise<{ ok: boolean; forwarded: boolean; data: unknown }> {
  const baseUrl = process.env.BACKEND_API_URL ?? 'http://localhost:5000/api/v1'

  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  const url = new URL(`${baseUrl.replace(/\/$/, '')}${normalizedPath}`)

  Object.entries(options.query ?? {}).forEach(([key, value]) => {
    if (value !== undefined) url.searchParams.set(key, String(value))
  })

  const method = options.method ?? (payload !== undefined ? 'POST' : 'GET')

  const res = await fetch(url, {
    method,
    headers: {
      'content-type': 'application/json',
      ...(process.env.BACKEND_API_KEY
        ? { authorization: `Bearer ${process.env.BACKEND_API_KEY}` }
        : {}),
      ...(options.headers ?? {}),
    },
    body: method === 'GET' || method === 'DELETE' ? undefined : JSON.stringify(options.body ?? payload ?? {}),
    cache: 'no-store',
    credentials: 'include',
  })

  if (!res.ok) {
    throw new Error(`Backend responded with ${res.status}`)
  }

  const data = await res.json().catch(() => null)
  return { ok: true, forwarded: true, data }
}
