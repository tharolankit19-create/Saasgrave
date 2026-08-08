import { createClient, createAdminClient } from "@/lib/supabase/server";

/**
 * Is the signed-in user an admin?
 *
 * Read through the service-role client so the check can't be defeated by row
 * policies, and keyed on `profiles.is_admin` rather than a hard-coded email —
 * granting or revoking admin is then a database change, not a deploy.
 */
export async function getAdminUser() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  try {
    const admin = createAdminClient();
    const { data } = await admin.from("profiles").select("is_admin").eq("id", user.id).single();
    return data?.is_admin ? user : null;
  } catch {
    // No service-role key configured — fail closed.
    return null;
  }
}

export async function isAdmin() {
  return (await getAdminUser()) !== null;
}
