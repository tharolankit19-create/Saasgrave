import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ListingForm } from "@/components/listing-form";

export const metadata = { title: "List a startup" };

export default async function SellPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/sell");

  const { data: profile } = await supabase
    .from("profiles")
    .select("onboarded")
    .eq("id", user.id)
    .single();
  if (!profile?.onboarded) redirect("/onboarding");

  return (
    <div className="grave-grid min-h-[calc(100vh-4rem)] px-5 py-14">
      <div className="mx-auto max-w-2xl">
        <div className="mb-8 text-center">
          <p className="text-xs font-medium uppercase tracking-[0.22em] text-ember-500">
            Write the autopsy
          </p>
          <h1 className="mt-3 font-serif text-4xl tracking-tight text-bone-100">
            Lay your startup to rest
          </h1>
          <p className="mt-2 text-sm text-bone-500">
            Honest listings sell. Tell the whole story — the fewer secrets, the more trust.
          </p>
        </div>
        <ListingForm />
      </div>
    </div>
  );
}
