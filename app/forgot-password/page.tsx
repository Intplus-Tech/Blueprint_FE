"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { Logo } from "@/components/logo";
import { AuthLayout } from "@/components/auth-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, ArrowLeft, MailCheck } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (!email) {
      setError("Please enter your email address.");
      return;
    }

    setIsSubmitting(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 700));
      setSent(true);
    } catch {
      setError("We couldn't send that link. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthLayout centered>
      <div className="flex flex-col items-center text-center">
        <Logo size="xl" className="mb-4" />
        <h1 className="text-xl font-medium text-gray-900">Forgot Password</h1>
      </div>

      {sent ? (
        <div className="mt-6 flex flex-col items-center gap-3 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-50">
            <MailCheck className="h-6 w-6 text-brand-600" />
          </div>
          <p className="text-sm text-gray-600">
            If an account exists for <span className="font-medium text-gray-900">{email}</span>,
            we&apos;ve sent a link to reset your password.
          </p>
          <Link
            href="/login"
            className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-brand-600 hover:text-brand-700"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to log in
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="mt-5 space-y-3" noValidate>
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

          {error && <p className="text-xs text-red-600">{error}</p>}

          <Button
            type="submit"
            className="h-9 w-full rounded-md bg-brand-600 text-white hover:bg-brand-700 font-medium transition-colors"
            disabled={isSubmitting}
          >
            {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
            Recover Password
          </Button>

          <Link
            href="/login"
            className="flex items-center justify-center gap-1 pt-1 text-xs font-medium text-gray-500 hover:text-gray-700"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to log in
          </Link>
        </form>
      )}
    </AuthLayout>
  );
}