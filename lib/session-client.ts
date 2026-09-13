import { useEffect, useState } from 'react'
import { getBackendUrl } from './api-client'

export type SessionUser = {
  id?: string | number | null
  email?: string | null
  name?: string | null
  fullName?: string | null
  firstName?: string | null
  lastName?: string | null
  username?: string | null
  [key: string]: unknown
}

export type BackendSession = {
  user?: SessionUser | null
  isAuthenticated?: boolean
  subscription?: Record<string, unknown> | null
  [key: string]: unknown
}

export function normalizeSessionPayload(payload: unknown): BackendSession | null {
  if (!payload || typeof payload !== 'object') return null

  const root = payload as Record<string, unknown>
  const data = root.data && typeof root.data === 'object' ? (root.data as Record<string, unknown>) : root
  const session = data.session && typeof data.session === 'object' ? (data.session as Record<string, unknown>) : data

  const user = session.user && typeof session.user === 'object'
    ? (session.user as SessionUser)
    : (data.user && typeof data.user === 'object' ? (data.user as SessionUser) : null)

  return {
    ...session,
    user,
    isAuthenticated: typeof session.isAuthenticated === 'boolean'
      ? session.isAuthenticated
      : Boolean(user),
    subscription: session.subscription && typeof session.subscription === 'object'
      ? (session.subscription as Record<string, unknown>)
      : null,
  }
}

export async function getSession(): Promise<BackendSession | null> {
  try {
    const res = await fetch(getBackendUrl('/session'), {
      credentials: 'include',
      cache: 'no-store',
    })
    if (!res.ok) return null

    const payload = await res.json().catch(() => null)
    return normalizeSessionPayload(payload)
  } catch (err) {
    console.error('getSession error', err)
    return null
  }
}

export function getSessionUserDisplayName(session: BackendSession | null): string {
  const user = session?.user
  if (!user) return 'Guest'

  const fullName = [user.fullName, user.name, [user.firstName, user.lastName].filter(Boolean).join(' ')].find(
    (value): value is string => typeof value === 'string' && value.trim().length > 0,
  )

  if (fullName) return fullName.trim()
  if (typeof user.email === 'string' && user.email.trim()) return user.email.trim()
  return 'Authenticated User'
}

export function useSessionData() {
  const [session, setSession] = useState<BackendSession | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    async function loadSession() {
      const data = await getSession()
      if (!cancelled) {
        setSession(data)
        setIsLoading(false)
      }
    }

    void loadSession()

    return () => {
      cancelled = true
    }
  }, [])

  return {
    session,
    isLoading,
    user: session?.user ?? null,
    displayName: getSessionUserDisplayName(session),
    isAuthenticated: Boolean(session?.isAuthenticated || session?.user),
  }
}

export default getSession
