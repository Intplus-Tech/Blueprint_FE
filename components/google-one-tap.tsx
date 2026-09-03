'use client'

import { X } from 'lucide-react'
import { motion, useReducedMotion } from 'motion/react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { getBackendUrl, postJson } from '@/lib/api-client'

function getGoogleSessionUser() {
  if (typeof window === 'undefined') {
    return { name: 'Google User', email: 'google-user@example.com' }
  }
  // localStorage usage removed; always return default placeholder
  return { name: 'Google User', email: 'google-user@example.com' }
}

function GoogleG() {
  return (
    <svg viewBox="0 0 48 48" className="size-6" aria-hidden="true">
      <path fill="#4285f4" d="M45.1 24.5c0-1.6-.1-3.1-.4-4.5H24v8.5h11.8c-.5 2.7-2 5-4.4 6.6v5.5h7.1c4.1-3.8 6.6-9.4 6.6-16.1Z" />
      <path fill="#34a853" d="M24 46c5.9 0 10.9-2 14.5-5.4l-7.1-5.5c-2 1.3-4.5 2.1-7.4 2.1-5.7 0-10.5-3.8-12.2-9H4.5v5.7C8.1 41.1 15.4 46 24 46Z" />
      <path fill="#fbbc05" d="M11.8 28.2c-.4-1.3-.7-2.7-.7-4.2s.2-2.9.7-4.2v-5.7H4.5A22 22 0 0 0 2 24c0 3.5.8 6.9 2.5 9.9l7.3-5.7Z" />
      <path fill="#ea4335" d="M24 10.8c3.2 0 6.1 1.1 8.4 3.3l6.3-6.3C34.9 4.1 29.9 2 24 2 15.4 2 8.1 6.9 4.5 14.1l7.3 5.7c1.7-5.2 6.5-9 12.2-9Z" />
    </svg>
  )
}

export function GoogleOneTap({ onClose }: { onClose: () => void }) {
  const reduceMotion = useReducedMotion()
  const router = useRouter()

  async function signIn() {
    const user = getGoogleSessionUser()

    try {
      const res = await fetch(getBackendUrl('/auth/google/auth-url'))
      if (res.ok) {
        const payload = await res.json().catch(() => null)
        const data = payload?.data ?? payload
        const url = data?.authUrl ?? data?.url ?? data?.redirectUrl

        if (typeof url === 'string' && url.startsWith('http')) {
          window.location.href = url
          return
        }

        if (typeof url === 'string' && url.startsWith('/')) {
          window.location.href = url
          return
        }
      }

      // No fallback or mock authentication — show an error
      toast.error('Google authentication is currently unavailable. Please try again later.')
      onClose()
      return
    } catch (err) {
      console.error('Google One Tap sign-in error', err)
      toast.error('Sign-in failed')
      onClose()
    }
  }

  return (
    <motion.div
      role="dialog"
      aria-label="Sign in with Google"
      initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -16, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className="pointer-events-auto w-80 overflow-hidden rounded-xl border border-border bg-card text-card-foreground shadow-2xl"
    >
      <div className="flex items-center gap-3 px-4 py-3">
        <GoogleG />
        <p className="flex-1 text-sm text-muted-foreground">
          Sign in to Blueprintdoc with Google One Tap
        </p>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          aria-label="Close Google sign in"
          className="size-7 text-muted-foreground"
        >
          <X className="size-4" />
        </Button>
      </div>

      <div className="flex items-center gap-3 px-4 pb-3">
        <span className="flex size-10 items-center justify-center rounded-full bg-muted text-sm font-semibold text-muted-foreground">
          GU
        </span>
        <div className="text-sm">
          <p className="font-semibold text-foreground">{getGoogleSessionUser().name}</p>
          <p className="text-muted-foreground">{getGoogleSessionUser().email}</p>
        </div>
      </div>

      <div className="px-4 pb-4">
        <Button
          onClick={signIn}
          className="w-full bg-brand font-semibold text-white hover:bg-brand-hover"
        >
          Continue with Google
        </Button>
      </div>

      <p className="px-4 pb-4 text-xs leading-relaxed text-muted-foreground">
        To create your account, Google will share your name, email address, and profile picture with
        Blueprintdoc. See Blueprintdoc&apos;s{' '}
        <a href="#" className="text-brand">
          privacy policy
        </a>{' '}
        and{' '}
        <a href="#" className="text-brand">
          terms of services.
        </a>
      </p>
    </motion.div>
  )
}