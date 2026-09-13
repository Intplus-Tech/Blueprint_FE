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
 * Consent is loaded from the backend and saved there as the source of truth.
 */
export function useCookiePreferences(): UseCookiePreferencesReturn {
  const [preferences, setPreferences] = useState<CookieConsent | null>(null)
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    const loadPreferences = async () => {
      try {
        const saved = await getSavedCookiePreferences()
        if (saved) {
          setPreferences(saved)
        }
      } catch (error) {
        console.error('Failed to fetch cookie preferences:', error)
      } finally {
        setIsLoaded(true)
      }
    }

    void loadPreferences()
  }, [])

  const save = (prefs: CookieConsent) => {
    void saveCookiePreferences(prefs).then((ok) => {
      if (ok) {
        setPreferences(prefs)
      }
    })
  }

  const clear = () => {
    void clearCookiePreferences().then((ok) => {
      if (ok) {
        setPreferences(null)
      }
    })
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
    return isCookieTypeAllowed(preferences, type)
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
