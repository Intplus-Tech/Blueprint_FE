import { getJson, postJson } from '@/lib/api-client'

export type CookieConsent = {
  essentials: true
  marketing: boolean
  externalMedia: boolean
}

export interface CookiePreferences extends CookieConsent {
  timestamp?: number
}

export const defaultCookieConsent: CookieConsent = {
  essentials: true,
  marketing: false,
  externalMedia: false,
}

export function normalizeCookieConsent(value: unknown): CookieConsent {
  const candidate = (typeof value === 'object' && value !== null ? value : {}) as Record<string, unknown>
  const wrappedConsent =
    candidate.consent && typeof candidate.consent === 'object'
      ? (candidate.consent as Record<string, unknown>)
      : candidate

  return {
    essentials: true,
    marketing: wrappedConsent.marketing === true,
    externalMedia: wrappedConsent.externalMedia === true,
  }
}

export async function getSavedCookiePreferences(): Promise<CookiePreferences | null> {
  try {
    const res = await getJson<{ consent?: CookieConsent | null }>('/cookie-consent')
    if (!res.ok || !res.data || res.data.consent === null) return null

    const normalized = normalizeCookieConsent(res.data)
    return {
      ...normalized,
      timestamp: Date.now(),
    }
  } catch (error) {
    console.error('Failed to load cookie preferences from backend:', error)
    return null
  }
}

export async function saveCookiePreferences(prefs: CookieConsent): Promise<boolean> {
  try {
    const res = await postJson('/cookie-consent', { consent: prefs })
    return res.ok
  } catch (error) {
    console.error('Failed to save cookie preferences to backend:', error)
    return false
  }
}

export async function clearCookiePreferences(): Promise<boolean> {
  try {
    const res = await postJson('/cookie-consent', { consent: defaultCookieConsent })
    return res.ok
  } catch (error) {
    console.error('Failed to clear cookie preferences on backend:', error)
    return false
  }
}

export function areCookiePreferencesExpired(_days: number = 30): boolean {
  return false
}

export function isCookieTypeAllowed(prefs: CookieConsent | null, type: keyof CookieConsent): boolean {
  return !!prefs && prefs[type] === true
}
