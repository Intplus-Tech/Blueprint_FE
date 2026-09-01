"use client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Logo } from "@/components/logo";
import { AuthLayout } from "@/components/auth-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
// import { Select } from "@/components/ui/select";
import { Loader2 } from "lucide-react";

const INDUSTRIES = [
  "Legal",
  "Real Estate",
  "Finance & Accounting",
  "Healthcare",
  "Construction",
  "Technology",
  "Other",
];

export default function SignupPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [industry, setIndustry] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (!fullName || !email || !password || !confirmPassword) {
      setError("Please fill in all required fields.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords don't match.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setIsSubmitting(true);
    try {
      // TODO: replace with your real sign-up call, e.g.:
      // await signUp({ fullName, email, industry, password });
      await new Promise((resolve) => setTimeout(resolve, 700));
      router.push("/dashboard");
    } catch {
      setError("We couldn't create your account. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleGoogleSignup() {
    // TODO: wire up your Google OAuth flow here
    console.log("Continue with Google");
  }

  return (
    <AuthLayout>
      <div className="flex flex-col items-center text-center">
        <h1 className="text-3xl text-gray-900">Sign Up</h1>
        <p className="mt-1 text-xs font-bold text-gray-500">
          Create your account to get started.
        </p>
      </div>

      <Button
        type="button"
        variant="outline"
        className="mt-4 w-full border-gray-300 bg-transparent text-gray-900 hover:bg-gray-50"
        onClick={handleGoogleSignup}
      >
        <GoogleIcon className="h-4 w-4" />
        Continue with Google
      </Button>

      <div className="my-5 flex items-center gap-3">
        <div className="h-px flex-1 bg-gray-200" />
        <span className="text-xs text-gray-400">OR</span>
        <div className="h-px flex-1 bg-gray-200" />
      </div>

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <div className="space-y-1.5">
          <Label htmlFor="fullName">Full Name</Label>
          <Input
            id="fullName"
            placeholder="John Doe"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            autoComplete="name"
          />
        </div>

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

        <div className="space-y-1.5">
        <Label htmlFor="industry" className="text-gray-900">What do you do?</Label>
        <Select 
          value={industry} onValueChange={setIndustry}>
        <SelectTrigger id="industry" className="h-9 w-full rounded-md border-gray-300 bg-transparent text-sm text-gray-900">
        <SelectValue placeholder="Select your industry" />
        </SelectTrigger>
        <SelectContent>
          {INDUSTRIES.map((item) => (
        <SelectItem key={item} value={item}>
          {item}
        </SelectItem>
      ))}
    </SelectContent>
  </Select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            placeholder="••••••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="confirmPassword">Confirm Password</Label>
          <Input
            id="confirmPassword"
            type="password"
            placeholder="••••••••••••"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            autoComplete="new-password"
          />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <Button
          type="submit"
          className="h-9 w-full rounded-md bg-[#006FEE] text-white hover:bg-[#005bc4] font-medium transition-colors"
          disabled={isSubmitting}
        >
          {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
          Create Account
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-gray-500">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-brand-600 hover:text-brand-700">
          Sign In
        </Link>
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
