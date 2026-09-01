import 'server-only'

export type BackendRequestOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  headers?: Record<string, string>
  query?: Record<string, string | number | boolean | undefined>
  body?: unknown
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
