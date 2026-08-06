'use client'

import { Logo } from './logo'

type SiteHeaderProps = {
  onNavClick: (label: 'Sign Up' | 'Sign In') => void
}

export function SiteHeader({ onNavClick }: SiteHeaderProps) {
  return (
    <header className="flex items-center justify-between px-5 py-5 sm:px-10 sm:py-7">
      <Logo />
      <nav aria-label="Account" className="flex items-center gap-2 text-sm text-white sm:text-base">
        <button
          type="button"
          onClick={() => onNavClick('Sign Up')}
          className="rounded-sm px-1 transition-colors hover:text-brand focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand"
        >
          Sign Up
        </button>
        <span aria-hidden="true" className="text-white/50">
          /
        </span>
        <button
          type="button"
          onClick={() => onNavClick('Sign In')}
          className="rounded-sm px-1 transition-colors hover:text-brand focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand"
        >
          Sign In
        </button>
      </nav>
    </header>
  )
}
