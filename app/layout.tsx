import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { PT_Sans, Dancing_Script } from 'next/font/google'
import { ThemeProvider } from '@/components/theme-provider'
import { Toaster } from '@/components/ui/sonner'
import { AppLayoutProvider } from '@/components/app-layout-provider'
import './globals.css'

const ptSans = PT_Sans({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-sans',
})

const dancingScript = Dancing_Script({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-script',
})

export const metadata: Metadata = {
  title: 'BlueprintDoc | Online E-Signature Platform',
  description: 'The only e-signature platform with built-in forensic AI.',
  generator: 'v0.app',
  icons: {
    icon: [
      {
        url: '/blueLogo.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/blueLogo.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/blueLogo.png',
        type: 'image/svg+xml',
      },
    ],
    apple: '/blueLogo.png',
  },
}

export const viewport: Viewport = {
  colorScheme: 'light dark',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: 'white' },
    { media: '(prefers-color-scheme: dark)', color: 'black' },
  ],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${ptSans.variable} ${dancingScript.variable} bg-background`}
    >
      <body className="font-sans antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          forcedTheme="light"
          disableTransitionOnChange
        >
          <a
            href="#main"
            className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-brand focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-white"
          >
            Skip to content
          </a>
          
          <AppLayoutProvider>
            {children}
          </AppLayoutProvider>
          <Toaster />
        </ThemeProvider>
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
