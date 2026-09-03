import { getBackendUrl } from './api-client'

export async function getSession(): Promise<Record<string, unknown> | null> {
  try {
    const res = await fetch(getBackendUrl('/session'))
    if (!res.ok) return null
    const payload = await res.json()
    if (payload && payload.data) return payload.data as Record<string, unknown>
    return null
  } catch (err) {
    console.error('getSession error', err)
    return null
  }
}

export default getSession
