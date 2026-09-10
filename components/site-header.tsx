'use client'

import { Logo } from './logo'

type SiteHeaderProps = {
  onNavClick: (label: 'Sign Up' | 'Sign In') => void
}

export function SiteHeader({ onNavClick }: SiteHeaderProps) {
  return (
    <header className="relative z-20 w-full">
      <div className="mx-auto flex w-full items-center justify-between px-4 py-5 sm:py-7">
        <div className="flex flex-1 items-center pl-0">
          <Logo
            variant="horizontal"
            size="lg"
            onDark
            className="w-[172px] drop-shadow-[0_0_12px_rgba(130,188,255,0.18)] sm:w-[220px] lg:w-[250px]"
          />
        </div>

        <nav
          aria-label="Account"
          className="ml-auto flex items-center gap-1.5 text-sm font-medium tracking-[0.02em] text-white/90 sm:gap-2 sm:text-[17px]"
        >
          <button
            type="button"
            onClick={() => onNavClick('Sign Up')}
            className="rounded-sm px-1 py-0.5 transition-colors duration-200 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand"
          >
            Sign Up
          </button>
          <span aria-hidden="true" className="select-none text-white/40">
            /
          </span>
          <button
            type="button"
            onClick={() => onNavClick('Sign In')}
            className="rounded-sm px-1 py-0.5 transition-colors duration-200 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand"
          >
            Sign In
          </button>
        </nav>
      </div>
    </header>
  )
}