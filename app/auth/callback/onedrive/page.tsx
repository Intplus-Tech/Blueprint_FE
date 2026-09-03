'use client'

import { Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { getBackendUrl } from '@/lib/api-client'

export default function OneDriveCallbackPage() {
  return (
    <Suspense fallback={<OneDriveCallbackLoading />}>
      <OneDriveCallbackContent />
    </Suspense>
  )
}

function OneDriveCallbackContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const code = searchParams.get('code')

    if (!code) {
      setError('OneDrive authentication did not return an authorization code.')
      return
    }

    const authCode = code
    let cancelled = false

    async function completeOneDrive() {
      try {
        const callbackUrl = new URL(getBackendUrl('/auth/onedrive/callback'))
        callbackUrl.searchParams.set('code', authCode)
        const res = await fetch(callbackUrl.toString())

        if (!res.ok) {
          const payload = await res.json().catch(() => null)
          throw new Error(payload?.message ?? 'OneDrive login failed.')
        }

        if (!cancelled) {
          router.replace('/dashboard')
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'OneDrive login failed.'
        if (!cancelled) {
          setError(message)
        }
      }
    }

    void completeOneDrive()

    return () => {
      cancelled = true
    }
  }, [router, searchParams])

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <div className="max-w-md rounded-xl border border-red-200 bg-white p-6 text-center shadow-sm">
          <h1 className="text-xl font-semibold text-slate-900">OneDrive sign-in failed</h1>
          <p className="mt-3 text-sm text-slate-600">{error}</p>
          <button
            type="button"
            onClick={() => router.replace('/login')}
            className="mt-5 inline-flex items-center justify-center rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
          >
            Back to login
          </button>
        </div>
      </div>
    )
  }

  return <OneDriveCallbackLoading />
}

function OneDriveCallbackLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="flex flex-col items-center gap-3 rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
        <Loader2 className="h-8 w-8 animate-spin text-slate-900" />
        <h1 className="text-lg font-semibold text-slate-900">Finishing OneDrive sign-in</h1>
        <p className="text-sm text-slate-600">Please wait while we complete your login.</p>
      </div>
    </div>
  )
}
