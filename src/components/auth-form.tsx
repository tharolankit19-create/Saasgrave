"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui";
import { GoogleButton } from "@/components/google-button";

export function AuthForm({ mode }: { mode: "login" | "register" }) {
  const supabase = createClient();
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") || "/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);

  const isRegister = mode === "register";

  async function handleEmail(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 6) return toast.error("Password must be at least 6 characters.");
    setLoading(true);

    if (isRegister) {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) {
        toast.error(error.message);
        setLoading(false);
        return;
      }
      toast.success("Account created. Check your inbox to confirm, then continue.");
      router.push("/onboarding");
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        toast.error(error.message);
        setLoading(false);
        return;
      }
      router.push(next);
      router.refresh();
    }
  }

  return (
    <div className="w-full max-w-sm">
      <div className="mb-6">
        <h1 className="font-serif text-3xl tracking-tight text-bone-100">
          {isRegister ? "Create your account" : "Welcome back"}
        </h1>
        <p className="mt-2 text-sm text-bone-500">
          {isRegister
            ? "Free forever. List, watch, and make offers in one account."
            : "Sign in to your listings, watchlist and offers."}
        </p>
      </div>

      {/* Fastest path — one click. */}
      <GoogleButton next={isRegister ? "/onboarding" : next} className="w-full" />

      <div className="my-5 flex items-center gap-3 text-xs text-bone-500">
        <div className="h-px flex-1 bg-black/10" />
        or with email
        <div className="h-px flex-1 bg-black/10" />
      </div>

      {/* Email + password, right there — no extra click to reveal it. */}
      <form onSubmit={handleEmail} className="space-y-3">
        {isRegister && (
          <Field
            label="Full name"
            type="text"
            value={fullName}
            onChange={setFullName}
            placeholder="Jane Founder"
            autoComplete="name"
            required
          />
        )}
        <Field
          label="Email"
          type="email"
          value={email}
          onChange={setEmail}
          placeholder="you@company.com"
          autoComplete="email"
          required
        />
        <Field
          label="Password"
          type="password"
          value={password}
          onChange={setPassword}
          placeholder="At least 6 characters"
          autoComplete={isRegister ? "new-password" : "current-password"}
          required
        />

        <Button type="submit" size="lg" className="w-full">
          {loading ? "One sec…" : isRegister ? "Create account" : "Sign in"}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-bone-500">
        {isRegister ? "Already have an account? " : "New here? "}
        <Link
          href={isRegister ? `/login${next ? `?next=${encodeURIComponent(next)}` : ""}` : "/register"}
          className="font-medium text-bone-100 underline underline-offset-4 hover:text-accent-600"
        >
          {isRegister ? "Sign in" : "Create one — free"}
        </Link>
      </p>

      <p className="mt-4 text-center text-[11px] leading-relaxed text-bone-500/80">
        Browsing stays free — always. No card to sign up.
      </p>
    </div>
  );
}

function Field({
  label,
  type,
  value,
  onChange,
  placeholder,
  required,
  autoComplete,
}: {
  label: string;
  type: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  required?: boolean;
  autoComplete?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium text-bone-400">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        autoComplete={autoComplete}
        className="h-11 w-full rounded-xl border border-black/10 bg-ink-900 px-4 text-sm text-bone-100 shadow-sm placeholder:text-bone-500/60 outline-none transition focus:border-accent-500/60 focus:ring-2 focus:ring-accent-500/15"
      />
    </label>
  );
}
