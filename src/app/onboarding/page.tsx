import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { OnboardingForm } from "@/components/onboarding-form";

export const metadata = { title: "Complete your profile" };

export default async function OnboardingPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/onboarding");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  // Already onboarded → straight to the dashboard.
  if (profile?.onboarded) redirect("/dashboard");

  return (
    <div className="grave-grid min-h-[calc(100vh-4rem)] px-5 py-16">
      <div className="mx-auto max-w-lg">
        <div className="mb-8 text-center">
          <p className="text-xs font-medium uppercase tracking-[0.22em] text-accent-500">Step 1 of 1</p>
          <h1 className="mt-3 font-serif text-3xl tracking-tight text-ink">Who are you?</h1>
          <p className="mt-2 text-sm text-ink-faint">
            A short introduction. This shows on your public founder profile.
          </p>
        </div>
        <OnboardingForm
          defaults={{
            full_name: profile?.full_name ?? "",
            avatar_url: profile?.avatar_url ?? "",
            x_handle: profile?.x_handle ?? "",
            linkedin_url: profile?.linkedin_url ?? "",
            failed_count: profile?.failed_count ?? 1,
            fail_reasons: profile?.fail_reasons ?? "",
          }}
        />
      </div>
    </div>
  );
}
