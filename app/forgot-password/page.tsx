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
      // TODO: replace with your real request, e.g.:
      // await requestPasswordReset({ email });
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
        <Logo size="lg" className="mb-6" />
        <h1 className="text-2xl font-semibold text-gray-900">Forgot Password</h1>
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
        <form onSubmit={handleSubmit} className="mt-6 space-y-4" noValidate>
          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="John@impresa.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
            Recover Password
          </Button>

          <Link
            href="/login"
            className="flex items-center justify-center gap-1 pt-1 text-sm font-medium text-gray-500 hover:text-gray-700"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to log in
          </Link>
        </form>
      )}
    </AuthLayout>
  );
}
