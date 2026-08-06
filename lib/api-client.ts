'use client'

/** POSTs JSON to a local route handler and returns the parsed response. */
export async function postJson<T>(
  url: string,
  payload: T,
): Promise<{ ok: boolean; status: number; data: unknown }> {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(payload),
  })
  const data = await res.json().catch(() => null)
  return { ok: res.ok, status: res.status, data }
}
