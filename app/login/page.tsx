"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Logo } from "@/components/logo";
import { AuthLayout } from "@/components/auth-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2 } from "lucide-react";
import { loginUser, persistAuthSession } from "@/lib/api-client";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (!email || !password) {
      setError("Please enter your email and password.");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = { email: email.trim(), password };
      const response = await loginUser(payload);

      const responseData = response?.data ?? response;
      persistAuthSession(responseData);

      router.push("/dashboard");
    } catch (err: any) {
      const serverMessage = err?.response?.data?.message || err?.response?.data?.error;
      const fallback = err?.message || "We couldn't log you in. Check your details and try again.";
      setError(serverMessage || fallback);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleGoogleLogin() {
    try {
      const res = await fetch('/api/auth/google/url')
      if (!res.ok) {
        throw new Error('Failed to get Google auth URL')
      }

      const payload = await res.json().catch(() => null)
      const url = payload?.data?.authUrl ?? payload?.data?.url ?? payload?.url ?? payload?.authUrl

      if (typeof url === 'string' && url.trim()) {
        window.location.href = url
        return
      }

      setError('Google authentication is currently unavailable. Please try again later.')
    } catch (error) {
      console.error('Google login failed:', error)
      setError('Google authentication failed. Please try again later.')
    }
  }

  return (
    <AuthLayout>
      <div className="flex flex-col items-center text-center">
        <Logo size="lg" className="mb-4" />
        <h1 className="text-2xl font-medium text-gray-900">Log in</h1>
        <p className="mt-1 text-xs text-gray-500">
          Welcome back! Please enter your details.
        </p>
      </div>

      <Button
        type="button"
        variant="outline"
        className="mt-4 w-full border-gray-300 bg-transparent text-gray-900 hover:bg-gray-50"
        onClick={handleGoogleLogin}
      >
        <GoogleIcon className="h-4 w-4" />
        Continue with Google
      </Button>

      <div className="my-3 text-center text-xs text-gray-400">- OR -</div>

      <form onSubmit={handleSubmit} className="space-y-3" noValidate>
        <div className="space-y-1">
          <Label htmlFor="email" className="text-xs">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="John@impresa.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            className="h-9 bg-transparent text-sm"
          />
        </div>

        <div className="space-y-1">
          <Label htmlFor="password" className="text-xs">Password</Label>
          <Input
            id="password"
            type="password"
            placeholder="••••••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            className="h-9 bg-transparent text-sm"
          />
        </div>

        <div className="flex items-center justify-between pt-1">
          <label className="flex cursor-pointer items-center gap-2 text-xs text-gray-600">
            <Checkbox checked={remember} onCheckedChange={setRemember} />
            Remember Password
          </label>
          <Link
            href="/forgot-password"
            className="text-xs font-medium text-brand-600 hover:text-brand-700"
          >
            Forgot Password
          </Link>
        </div>

        {error && <p className="text-xs text-red-600">{error}</p>}

        <Button
          type="submit"
          className="h-9 w-full rounded-md bg-[#006FEE] text-white hover:bg-[#005bc4] font-medium transition-colors"
          disabled={isSubmitting}
        >
          {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
          Log In
        </Button>
      </form>

      <p className="mt-4 text-center text-xs text-gray-500">
        Don&apos;t have an account?{" "}
        <Link href="/signup" className="font-medium text-brand-600 hover:text-brand-700">
          Sign Up
        </Link>
      </p>

      <p className="mt-6 text-center text-xs text-gray-400">
        Powered By: <span className="font-medium text-gray-600">Al Torney</span>
      </p>
    </AuthLayout>
  );
}

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path
        d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58v3h3.86c2.26-2.09 3.56-5.17 3.56-8.82z"
        fill="#4285F4"
      />
      <path
        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96H1.29v3.09C3.26 21.3 7.31 24 12 24z"
        fill="#34A853"
      />
      <path
        d="M5.27 14.29c-.25-.72-.38-1.49-.38-2.29s.14-1.57.38-2.29V6.62H1.29A11.96 11.96 0 000 12c0 1.93.46 3.76 1.29 5.38l3.98-3.09z"
        fill="#FBBC05"
      />
      <path
        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.98 3.09C6.22 6.86 8.87 4.75 12 4.75z"
        fill="#EA4335"
      />
    </svg>
  );
}