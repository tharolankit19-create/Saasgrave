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
  const [showEmail, setShowEmail] = useState(false);

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
      <div className="mb-7">
        <h1 className="font-serif text-3xl tracking-tight text-bone-100">
          {isRegister ? "Create your account" : "Welcome back"}
        </h1>
        <p className="mt-2 text-sm text-bone-500">
          {isRegister
            ? "Free forever. One account to list, watch, and make offers."
            : "Sign in to your listings, watchlist and offers."}
        </p>
      </div>

      <GoogleButton next={isRegister ? "/onboarding" : next} className="w-full" />
      <p className="mt-2 text-center text-xs text-bone-500">
        Fastest way in — no password to remember.
      </p>

      <div className="my-5 flex items-center gap-3 text-xs text-bone-500">
        <div className="h-px flex-1 bg-black/8" />
        or use email
        <div className="h-px flex-1 bg-black/8" />
      </div>

      {!showEmail ? (
        <button
          onClick={() => setShowEmail(true)}
          className="h-11 w-full rounded-full border border-black/10 bg-ink-900 text-sm font-medium text-bone-300 transition hover:border-black/25 hover:text-bone-100"
        >
          {isRegister ? "Sign up with email" : "Sign in with email"}
        </button>
      ) : (
        <form onSubmit={handleEmail} className="space-y-3">
          {isRegister && (
            <Field
              label="Full name"
              type="text"
              value={fullName}
              onChange={setFullName}
              placeholder="Jane Founder"
              required
            />
          )}
          <Field label="Email" type="email" value={email} onChange={setEmail} placeholder="you@company.com" required />
          <Field label="Password" type="password" value={password} onChange={setPassword} placeholder="••••••••" required />

          <Button type="submit" size="lg" className="w-full" disabled={loading}>
            {loading ? "…" : isRegister ? "Create account" : "Sign in"}
          </Button>
        </form>
      )}

      <p className="mt-6 text-center text-sm text-bone-500">
        {isRegister ? "Already have an account? " : "New here? "}
        <Link
          href={isRegister ? "/login" : "/register"}
          className="text-bone-100 underline underline-offset-4 hover:text-accent-400"
        >
          {isRegister ? "Sign in" : "Create one — free"}
        </Link>
      </p>

      <p className="mt-4 text-center text-[11px] leading-relaxed text-bone-500/80">
        By continuing you agree to keep it honest. Browsing stays free — always.
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
}: {
  label: string;
  type: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium text-bone-500">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        className="h-11 w-full rounded-xl border border-black/10 bg-ink-900 px-4 text-sm text-bone-100 placeholder:text-bone-500/60 outline-none transition focus:border-accent-500/50"
      />
    </label>
  );
}
