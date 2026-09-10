'use client'

import { Suspense, useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { verifyEmail } from '@/lib/api-client'

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<VerifyEmailLoading />}>
      <VerifyEmailContent />
    </Suspense>
  )
}

function VerifyEmailContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    const token =
      searchParams.get('token') ??
      searchParams.get('verification_token') ??
      searchParams.get('code')

    if (!token) {
      setError('This email verification link is missing a valid token.')
      return
    }

    const verifiedToken = token
    let cancelled = false

    async function confirmEmail() {
      try {
        await verifyEmail(verifiedToken)

        if (!cancelled) {
          setSuccess(true)
          window.setTimeout(() => {
            router.replace('/login?verified=1')
          }, 1200)
        }
      } catch (err: any) {
        const message =
          err?.response?.data?.message ||
          err?.response?.data?.error ||
          err?.response?.data?.detail ||
          err?.message ||
          'We could not verify your email address.'

        if (!cancelled) {
          setError(message)
        }
      }
    }

    void confirmEmail()

    return () => {
      cancelled = true
    }
  }, [router, searchParams])

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <div className="max-w-md rounded-xl border border-red-200 bg-white p-6 text-center shadow-sm">
          <h1 className="text-xl font-semibold text-slate-900">Email verification failed</h1>
          <p className="mt-3 text-sm text-slate-600">{error}</p>
          <div className="mt-5 flex justify-center gap-3">
            <Link
              href="/login"
              className="inline-flex items-center justify-center rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
            >
              Back to login
            </Link>
          </div>
        </div>
      </div>
    )
  }

  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <div className="max-w-md rounded-xl border border-emerald-200 bg-white p-6 text-center shadow-sm">
          <h1 className="text-xl font-semibold text-slate-900">Email verified</h1>
          <p className="mt-3 text-sm text-slate-600">Your email address has been successfully verified.</p>
          <Link
            href="/login"
            className="mt-5 inline-flex items-center justify-center rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-500"
          >
            Continue to sign in
          </Link>
        </div>
      </div>
    )
  }

  return <VerifyEmailLoading />
}

function VerifyEmailLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="flex flex-col items-center gap-3 rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
        <Loader2 className="h-8 w-8 animate-spin text-slate-900" />
        <h1 className="text-lg font-semibold text-slate-900">Verifying your email</h1>
        <p className="text-sm text-slate-600">Please wait while we confirm your account.</p>
      </div>
    </div>
  )
}
