export type SessionInfo = {
  user?: { id: string; email?: string; name?: string; role?: string }
  isAuthenticated?: boolean
}

export async function getSession(): Promise<SessionInfo | null> {
  try {
    const res = await fetch('/api/session')
    if (!res.ok) return null
    const payload = await res.json()
    // payload.data is whatever backend returned; normalize
    if (payload && payload.data) return payload.data as SessionInfo
    return null
  } catch (err) {
    console.error('getSession error', err)
    return null
  }
}

export default getSession
