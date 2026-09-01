'use client'

import { useId, useState } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { postJson } from '@/lib/api-client'
import { saveCookiePreferences } from '@/lib/cookie-preferences'
import type { CookieConsent } from '@/lib/schemas'

type Prefs = Omit<CookieConsent, 'essentials'> & { essentials: true }

export function CookieBanner({ onClose }: { onClose: () => void }) {
  const reduceMotion = useReducedMotion()
  const marketingId = useId()
  const externalId = useId()
  const essentialsId = useId()
  const [prefs, setPrefs] = useState<Prefs>({
    essentials: true,
    marketing: true,
    externalMedia: false,
  })

  async function submit(accepted: boolean) {
    const payload: CookieConsent = accepted
      ? prefs
      : { essentials: true, marketing: false, externalMedia: false }
    const res = await postJson('/api/cookie-consent', payload)
    if (res.ok) {
      saveCookiePreferences(payload)
      toast.success(accepted ? 'Preferences saved' : 'Only essentials kept')
    } else {
      toast.error('Could not save preferences')
    }
    onClose()
  }

  return (
    <motion.div
      role="dialog"
      aria-label="Cookie consent"
      initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="pointer-events-auto w-[80%] max-w-4xl rounded-xl border border-border bg-card p-4 text-card-foreground shadow-2xl sm:p-6"
    >
      <h2 className="mb-4 text-lg font-bold text-brand">This website uses cookies</h2>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
        <div className="flex-1 space-y-3 text-sm leading-relaxed text-muted-foreground">
          <p>
            We&apos;re not talking about the crunchy, tasty kind. These cookies help us keep our
            website safe, give you a better experience and show more relevant ads. We won&apos;t{' '}
            <a href="#" className="text-brand underline">
              privacy policy
            </a>
          </p>
          <p>
            We&apos;re not talking about the crunchy, tasty kind. These cookies help us keep our
            website safe, give you a better experience and show more
          </p>
        </div>

        <div className="flex shrink-0 flex-col gap-2 sm:w-44">
          <Button
            onClick={() => submit(true)}
            className="rounded-full bg-brand font-semibold text-white hover:bg-brand-hover"
          >
            Accept cookies
          </Button>
          <Button
            variant="outline"
            onClick={() => submit(false)}
            className="rounded-full font-semibold"
          >
            Decline cookies
          </Button>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-border pt-4 text-sm">
        <div className="flex items-center gap-2">
          <Checkbox id={essentialsId} checked disabled aria-label="Essentials (required)" />
          <Label htmlFor={essentialsId} className="text-muted-foreground">
            Essentials
          </Label>
        </div>
        <div className="flex items-center gap-2">
          <Checkbox
            id={marketingId}
            checked={prefs.marketing}
            onCheckedChange={(v) => setPrefs((p) => ({ ...p, marketing: v === true }))}
          />
          <Label htmlFor={marketingId}>Marketing</Label>
        </div>
        <div className="flex items-center gap-2">
          <Checkbox
            id={externalId}
            checked={prefs.externalMedia}
            onCheckedChange={(v) => setPrefs((p) => ({ ...p, externalMedia: v === true }))}
          />
          <Label htmlFor={externalId}>External media</Label>
        </div>
        <a href="#" className="ml-auto text-muted-foreground underline">
          Cookies settings
        </a>
      </div>
    </motion.div>
  )
}