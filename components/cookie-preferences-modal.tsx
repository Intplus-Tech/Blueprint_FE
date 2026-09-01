'use client'

import { useId, useState, useEffect } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { postJson } from '@/lib/api-client'
import { useCookiePreferences } from '@/lib/use-cookie-preferences'
import type { CookieConsent } from '@/lib/schemas'

export interface CookiePreferencesModalProps {
  isOpen: boolean
  onClose: () => void
}

const cookieTypes = {
  essentials: {
    label: 'Essential Cookies',
    description: 'Required for the website to function properly. These cannot be disabled.',
    required: true,
  },
  marketing: {
    label: 'Marketing Cookies',
    description: 'Help us show you personalized ads and track campaign effectiveness.',
    required: false,
  },
  externalMedia: {
    label: 'External Media',
    description: 'Allow us to embed content from external services like YouTube and Vimeo.',
    required: false,
  },
}

/**
 * Cookie preferences management modal
 * Allows users to customize their cookie consent settings
 */
export function CookiePreferencesModal({ isOpen, onClose }: CookiePreferencesModalProps) {
  const reduceMotion = useReducedMotion()
  const { preferences, save, clear } = useCookiePreferences()
  const essentialsId = useId()
  const marketingId = useId()
  const externalId = useId()

  const [prefs, setPrefs] = useState<CookieConsent>({
    essentials: true,
    marketing: false,
    externalMedia: false,
  })

  const [isSaving, setIsSaving] = useState(false)

  // Load current preferences
  useEffect(() => {
    if (preferences) {
      setPrefs(preferences)
    }
  }, [preferences, isOpen])

  async function handleSave() {
    setIsSaving(true)
    try {
      const res = await postJson('/api/cookie-consent', prefs)
      if (res.ok) {
        save(prefs)
        onClose()
      }
    } catch (error) {
      console.error('Failed to save cookie preferences:', error)
    } finally {
      setIsSaving(false)
    }
  }

  function handleClearAll() {
    if (confirm('Are you sure you want to clear all your cookie preferences?')) {
      clear()
      setPrefs({
        essentials: true,
        marketing: false,
        externalMedia: false,
      })
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <motion.div
        role="dialog"
        aria-label="Cookie preferences"
        initial={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ duration: 0.3 }}
        className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-xl border border-border bg-card p-6 text-card-foreground shadow-2xl m-4"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-brand">Cookie Preferences</h2>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-muted rounded-lg transition-colors"
            aria-label="Close preferences"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Description */}
        <p className="text-sm text-muted-foreground mb-6">
          Manage your cookie preferences. Learn more in our{' '}
          <a href="/privacy" className="text-brand underline hover:opacity-75">
            privacy policy
          </a>
          .
        </p>

        {/* Cookie Type List */}
        <div className="space-y-4 mb-6">
          {(Object.entries(cookieTypes) as [keyof typeof cookieTypes, (typeof cookieTypes)[keyof typeof cookieTypes]][]).map(
            ([key, info]) => (
              <div key={key} className="border border-border rounded-lg p-4 space-y-3">
                <div className="flex items-start gap-3">
                  <Checkbox
                    id={key}
                    checked={prefs[key]}
                    disabled={info.required}
                    onCheckedChange={(v) =>
                      setPrefs((p) => ({
                        ...p,
                        [key]: v === true,
                      }))
                    }
                  />
                  <div className="flex-1">
                    <Label htmlFor={key} className="font-semibold text-sm cursor-pointer block mb-1">
                      {info.label}
                      {info.required && <span className="ml-2 text-xs text-muted-foreground">(Required)</span>}
                    </Label>
                    <p className="text-xs text-muted-foreground">{info.description}</p>
                  </div>
                </div>
              </div>
            ),
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-2">
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="w-full bg-brand text-white font-semibold rounded-full hover:bg-brand-hover"
          >
            {isSaving ? 'Saving...' : 'Save Preferences'}
          </Button>

          <div className="flex gap-2">
            <Button
              onClick={onClose}
              variant="outline"
              className="flex-1 rounded-full font-semibold"
            >
              Cancel
            </Button>
            <Button
              onClick={handleClearAll}
              variant="outline"
              className="flex-1 text-destructive rounded-full font-semibold hover:bg-destructive/5"
            >
              Clear All
            </Button>
          </div>
        </div>

        {/* Help text */}
        <p className="mt-4 text-xs text-muted-foreground text-center">
          Your preferences are saved in your browser and can be updated anytime.
        </p>
      </motion.div>
    </div>
  )
}
