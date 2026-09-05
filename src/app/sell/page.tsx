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

  // No onboarding gate — signed-in users can list right away.
  return (
    <div className="min-h-[calc(100vh-4rem)] px-5 py-14">
      <div className="mx-auto max-w-2xl">
        <div className="mb-8 text-center">
          <p className="text-xs font-medium uppercase tracking-[0.22em] text-accent-500">
            List a startup
          </p>
          <h1 className="mt-3 font-serif text-4xl tracking-tight text-bone-100">
            Tell us what you built
          </h1>
          <p className="mt-2 text-sm text-bone-500">
            Honest listings sell. The more of the story you share, the more buyers trust it.
          </p>
        </div>
        <p className="mb-4 text-center text-xs text-bone-500">Free launch requires our badge on your landing page. Paid launch starts at $9 and needs no badge. Choose at the final step.</p>
        <ListingForm />
      </div>
    </div>
  );
}
