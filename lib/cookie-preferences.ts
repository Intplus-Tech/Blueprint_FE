/**
 * Cookie preferences management using cookie persistence (no localStorage)
 */

import type { CookieConsent } from '@/lib/schemas'

const COOKIE_CONSENT_COOKIE = 'bp-cookie-consent'

export interface CookiePreferences extends CookieConsent {
  timestamp?: number
}

function readCookie(name: string): string | null {
  if (typeof document === 'undefined') return null
  const match = document.cookie.match(new RegExp('(^|; )' + name.replace(/([.$?*|{}()\[\]\\\/+^])/g, '\\$1') + '=([^;]*)'))
  return match ? decodeURIComponent(match[2]) : null
}

function writeCookie(name: string, value: string, days = 30) {
  if (typeof document === 'undefined') return
  const expires = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toUTCString()
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; expires=${expires}; SameSite=Lax`
}

function removeCookie(name: string) {
  if (typeof document === 'undefined') return
  document.cookie = `${name}=; path=/; expires=${new Date(0).toUTCString()}; SameSite=Lax`
}

/**
 * Get saved cookie preferences from the `bp-cookie-consent` cookie
 */
export function getSavedCookiePreferences(): CookiePreferences | null {
  const raw = readCookie(COOKIE_CONSENT_COOKIE)
  if (!raw) return null

  try {
    const parsed = JSON.parse(raw) as CookiePreferences
    return parsed
  } catch {
    return null
  }
}

/**
 * Save cookie preferences to a cookie (replaces localStorage persistence)
 */
export function saveCookiePreferences(prefs: CookieConsent): CookiePreferences {
  const withTimestamp: CookiePreferences = {
    ...prefs,
    timestamp: Date.now(),
  }

  try {
    writeCookie(COOKIE_CONSENT_COOKIE, JSON.stringify(withTimestamp), 30)
  } catch {
    // ignore cookie write failures
  }

  return withTimestamp
}

/**
 * Clear saved cookie preferences
 */
export function clearCookiePreferences(): void {
  removeCookie(COOKIE_CONSENT_COOKIE)
}

/**
 * Check if preferences have expired (older than `days` days)
 */
export function areCookiePreferencesExpired(days: number = 30): boolean {
  const prefs = getSavedCookiePreferences()
  if (!prefs || !prefs.timestamp) return true

  const expirationTime = days * 24 * 60 * 60 * 1000
  return Date.now() - prefs.timestamp > expirationTime
}

/**
 * Check if a specific cookie type is allowed
 */
export function isCookieTypeAllowed(type: keyof CookieConsent): boolean {
  const prefs = getSavedCookiePreferences()
  if (!prefs) return false
  return prefs[type] === true
}
