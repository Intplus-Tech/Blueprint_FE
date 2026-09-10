'use client'

import { useEffect, useState } from 'react'
import {
  getSavedCookiePreferences,
  saveCookiePreferences,
  clearCookiePreferences,
  isCookieTypeAllowed,
  areCookiePreferencesExpired,
  type CookieConsent,
} from '@/lib/cookie-preferences'

export interface UseCookiePreferencesReturn {
  preferences: CookieConsent | null
  isLoaded: boolean
  hasConsented: boolean
  isSaved: (prefs: CookieConsent) => boolean
  save: (prefs: CookieConsent) => void
  clear: () => void
  isAllowed: (type: keyof CookieConsent) => boolean
  isExpired: () => boolean
}

/**
 * Hook to manage cookie preferences in the current session.
 * Consent is sent to the backend and is not persisted in the browser.
 */
export function useCookiePreferences(): UseCookiePreferencesReturn {
  const [preferences, setPreferences] = useState<CookieConsent | null>(null)
  const [isLoaded, setIsLoaded] = useState(false)

  // Load preferences on mount from the backend-only consent state.
  useEffect(() => {
    const saved = getSavedCookiePreferences()
    if (saved) {
      setPreferences(saved)
    }
    setIsLoaded(true)
  }, [])

  const save = (prefs: CookieConsent) => {
    saveCookiePreferences(prefs)
    setPreferences(prefs)
  }

  const clear = () => {
    clearCookiePreferences()
    setPreferences(null)
  }

  const isSaved = (prefs: CookieConsent) => {
    if (!preferences) return false
    return (
      preferences.essentials === prefs.essentials &&
      preferences.marketing === prefs.marketing &&
      preferences.externalMedia === prefs.externalMedia
    )
  }

  const isAllowed = (type: keyof CookieConsent) => {
    if (!preferences) return false
    return isCookieTypeAllowed(type)
  }

  const isExpired = () => areCookiePreferencesExpired()

  return {
    preferences,
    isLoaded,
    hasConsented: preferences !== null,
    save,
    clear,
    isSaved,
    isAllowed,
    isExpired,
  }
}
