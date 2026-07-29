import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// Server component / route-handler client (respects RLS via the user's session).
export function createClient() {
  const cookieStore = cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options?: any }[]) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Called from a Server Component — safe to ignore, middleware refreshes.
          }
        },
      },
    }
  );
}

// Privileged client — bypasses RLS. Use ONLY in trusted server code
// (webhooks, admin writes). Never import this into client components.
import { createClient as createSbClient } from "@supabase/supabase-js";
export function createAdminClient() {
  return createSbClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );
}
