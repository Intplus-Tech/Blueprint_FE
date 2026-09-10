/**
 * Cookie preferences are intentionally not persisted in the browser.
 * The backend owns consent state; this frontend module is an explicit no-op.
 */

export type CookieConsent = {
  essentials: true
  marketing: boolean
  externalMedia: boolean
}

export interface CookiePreferences extends CookieConsent {
  timestamp?: number
}

export function getSavedCookiePreferences(): CookiePreferences | null {
  // Intentionally no-op: no browser persistence.
  return null
}

export function saveCookiePreferences(_prefs: CookieConsent): void {
  // Intentionally no-op: consent is submitted to the backend only.
}

export function clearCookiePreferences(): void {
  // Intentionally no-op: browser cookie persistence is disabled.
}

export function areCookiePreferencesExpired(_days: number = 30): boolean {
  return true
}

export function isCookieTypeAllowed(_type: keyof CookieConsent): boolean {
  return false
}
