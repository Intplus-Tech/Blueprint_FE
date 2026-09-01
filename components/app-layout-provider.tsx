'use client'

import React, { ReactNode, useState } from 'react'
import { NotificationWidget } from '@/components/notification-widget'
import { CookiePreferencesModal } from '@/components/cookie-preferences-modal'
import { useCookiePreferences } from '@/lib/use-cookie-preferences'

export interface AppLayoutProviderProps {
  children: ReactNode
}

/**
 * App-wide layout provider that manages:
 * - Notification widget
 * - Cookie preferences modal
 * - Global UI state
 */
export function AppLayoutProvider({ children }: AppLayoutProviderProps) {
  const [cookiePrefOpen, setCookiePrefOpen] = useState(false)
  const { preferences } = useCookiePreferences()

  return (
    <>
      {children}

      {/* Global Notification Widget */}
      <NotificationWidget position="top-right" maxVisible={3} />

      {/* Cookie Preferences Modal - can be opened via settings */}
      <CookiePreferencesModal isOpen={cookiePrefOpen} onClose={() => setCookiePrefOpen(false)} />

      {/* Global style - expose setCookiePrefsOpen to window for easy access */}
      <script
        dangerouslySetInnerHTML={{
          __html: `
            window.openCookiePreferences = function() {
              // This would be better handled via context, but for now we can dispatch a custom event
              const event = new CustomEvent('open-cookie-preferences');
              window.dispatchEvent(event);
            }
          `,
        }}
      />
    </>
  )
}

/**
 * Hook to control global UI elements
 */
export function useAppLayout() {
  return {
    openCookiePreferences: () => {
      const event = new CustomEvent('open-cookie-preferences')
      window.dispatchEvent(event)
    },
  }
}
