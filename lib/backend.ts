import 'server-only'

/**
 * Forwards a validated payload to the existing backend service.
 *
 * The backend base URL is read from BACKEND_API_URL (server-only). When it is
 * not configured, we no-op gracefully and echo the payload back so the UI
 * stays functional in preview/local environments without a live backend.
 */
export async function forwardToBackend<T>(
  path: string,
  payload: T,
): Promise<{ ok: boolean; forwarded: boolean; data: unknown }> {
  const baseUrl = process.env.BACKEND_API_URL

  if (!baseUrl) {
    // No backend configured — accept and echo so the flow completes.
    return { ok: true, forwarded: false, data: payload }
  }

  const res = await fetch(`${baseUrl.replace(/\/$/, '')}${path}`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      ...(process.env.BACKEND_API_KEY
        ? { authorization: `Bearer ${process.env.BACKEND_API_KEY}` }
        : {}),
    },
    body: JSON.stringify(payload),
    cache: 'no-store',
  })

  if (!res.ok) {
    throw new Error(`Backend responded with ${res.status}`)
  }

  const data = await res.json().catch(() => null)
  return { ok: true, forwarded: true, data }
}
