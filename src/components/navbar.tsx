import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { LinkButton } from "@/components/ui";
import { UserMenu } from "@/components/user-menu";

export async function Navbar() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let avatarUrl: string | null = null;
  let name: string | null = null;
  if (user) {
    const { data } = await supabase
      .from("profiles")
      .select("full_name, avatar_url")
      .eq("id", user.id)
      .single();
    avatarUrl = data?.avatar_url ?? null;
    name = data?.full_name ?? user.email ?? null;
  }

  return (
    <header className="sticky top-0 z-40 border-b border-white/8 bg-ink-950/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 sm:px-8">
        <Link href="/" className="group flex items-center gap-2.5">
          <span className="grid h-7 w-7 place-items-center rounded-md border border-white/12 text-ember-500">
            †
          </span>
          <span className="font-serif text-lg tracking-tight text-bone-100">Graveyard</span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          <Link href="/browse" className="rounded-full px-4 py-2 text-sm text-bone-300 transition hover:text-bone-100">
            Browse
          </Link>
          <Link href="/sales" className="rounded-full px-4 py-2 text-sm text-bone-300 transition hover:text-bone-100">
            For Sale
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
