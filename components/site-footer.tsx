'use client'

import { ChevronDown } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

const TEMPLATES = ['Contracts', 'NDAs', 'Invoices', 'Offer Letters']

export function SiteFooter() {
  const linkClass =
    'rounded-sm transition-colors hover:text-brand focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand'

  return (
    <footer className="flex flex-col gap-6 px-5 py-6 text-sm text-white/80 sm:px-10 md:flex-row md:items-center md:justify-between">
      <p className="flex items-center gap-1.5 whitespace-nowrap">
        <span aria-hidden="true">&copy;</span> 2025 Torney.cc.{' '}
        <span className="text-white/60">All Rights Reserved</span>
      </p>

      <nav aria-label="Resources" className="flex items-center gap-6">
        <a href="#" className={linkClass}>
          Pricing
        </a>
        <DropdownMenu>
          <DropdownMenuTrigger className={`group flex items-center gap-1.5 ${linkClass} data-[popup-open]:text-brand`}>
            Templates
            <ChevronDown className="size-4 transition-transform group-data-[popup-open]:rotate-180" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" side="top" className="min-w-40">
            {TEMPLATES.map((item) => (
              <DropdownMenuItem key={item}>{item}</DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </nav>

      <nav aria-label="Legal" className="flex items-center gap-6">
        <a href="#" className={linkClass}>
          Support
        </a>
        <a href="#" className={linkClass}>
          Terms of Use
        </a>
        <a href="#" className={linkClass}>
          Privacy Policy
        </a>
      </nav>
    </footer>
  )
}
