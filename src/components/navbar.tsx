import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { LinkButton } from "@/components/ui";
import { Logo } from "@/components/logo";
import { UserMenu } from "@/components/user-menu";

export async function Navbar() {
  const supabase = createClient();
  // getSession reads the cookie locally (no network round-trip) — the navbar is
  // display-only, and route protection is enforced in middleware. Name/avatar
  // come from the JWT's user_metadata, so there's no per-navigation DB query.
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const user = session?.user ?? null;

  const meta = (user?.user_metadata ?? {}) as Record<string, string | undefined>;
  const name = user ? meta.full_name || meta.name || user.email || null : null;
  const avatarUrl = user ? meta.avatar_url || meta.picture || null : null;

  return (
    <header className="sticky top-0 z-40 border-b border-black/[0.06] bg-ink-950/85 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 sm:px-8">
        <Link href="/" className="group">
          <Logo />
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          <Link href="/browse" className="rounded-full px-4 py-2 text-sm text-bone-300 transition hover:text-bone-100">
            Browse
          </Link>
          <Link href="/sales" className="rounded-full px-4 py-2 text-sm text-bone-300 transition hover:text-bone-100">
            For sale
          </Link>
          <Link href="/#pricing" className="rounded-full px-4 py-2 text-sm text-bone-300 transition hover:text-bone-100">
            Pricing
          </Link>
          <Link href="/sell" className="rounded-full px-4 py-2 text-sm text-bone-300 transition hover:text-bone-100">
            List a startup
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          {user ? (
            <UserMenu name={name} avatarUrl={avatarUrl} />
          ) : (
            <>
              <LinkButton href="/login" variant="ghost" size="sm" className="hidden sm:inline-flex">
                Sign in
              </LinkButton>
              <LinkButton href="/register" size="sm">
                Get started
              </LinkButton>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
