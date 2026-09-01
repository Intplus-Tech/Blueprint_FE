'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { AnimatePresence } from 'motion/react'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'
import { AnimatedBackground } from '@/components/animated-background'
import { Hero } from '@/components/hero'
import { CookieBanner } from '@/components/cookie-banner'
import { GoogleOneTap } from '@/components/google-one-tap'

export default function Page() {
  const router = useRouter()
  const [showCookies, setShowCookies] = useState(true)
  const [showOneTap, setShowOneTap] = useState(true)

  function handleNavClick(label: 'Sign Up' | 'Sign In') {
    if (label === 'Sign In') {
      router.push('/login')
    } else if (label === 'Sign Up') {
      router.push('/signup')
    }
  }

  return (
    <main className="tablet-responsive relative flex min-h-dvh flex-col overflow-hidden text-white">
      <AnimatedBackground />

      {/* Foreground content */}
      <div id="main" className="tablet-main relative z-10 flex min-h-dvh flex-col">
        <SiteHeader onNavClick={handleNavClick} />
        <Hero />
        <SiteFooter />
      </div>

      {/* Google One Tap popup */}
      <AnimatePresence>
        {showOneTap && (
          <div className="fixed top-4 right-4 z-40 sm:top-6 sm:right-6">
            <GoogleOneTap onClose={() => setShowOneTap(false)} />
          </div>
        )}
      </AnimatePresence>

      {/* Cookie consent banner */}
      <AnimatePresence>
        {showCookies && (
          <div className="pointer-events-none fixed inset-x-0 bottom-0 z-30 px-4 pb-4 sm:px-6 sm:pb-6">
            <CookieBanner onClose={() => setShowCookies(false)} />
          </div>
        )}
      </AnimatePresence>
    </main>
  )
}