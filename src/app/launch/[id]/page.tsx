import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { confirmLaunchPayment } from "@/lib/launch-payment";
import { LaunchPlans } from "@/components/launch-plans";
import { LinkButton } from "@/components/ui";

export const metadata = {
  title: "Choose your launch",
  robots: { index: false, follow: false },
};
export const dynamic = "force-dynamic";
export default async function LaunchPage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { order?: string; payment_id?: string };
}) {
  if (!z.string().uuid().safeParse(params.id).success) notFound();
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    redirect(`/login?next=${encodeURIComponent(`/launch/${params.id}`)}`);
  const { data: startup } = await supabase
    .from("startups")
    .select("id, slug, name, website_url, status, launch_paid")
    .eq("id", params.id)
    .eq("founder_id", user.id)
    .single();
  if (!startup) notFound();
  let order = null;
  if (
    searchParams.order &&
    z.string().uuid().safeParse(searchParams.order).success
  ) {
    const { data } = await supabase
      .from("launch_orders")
      .select("*")
      .eq("id", searchParams.order)
      .eq("startup_id", startup.id)
      .eq("user_id", user.id)
      .single();
    order = data;
    if (order && searchParams.payment_id && !order.fulfilled_at) {
      try {
        order =
          (await confirmLaunchPayment(
            order.id,
            searchParams.payment_id,
            user.id,
          )) || order;
      } catch (e) {
        console.error("launch confirmation:", e);
      }
    }
  }
  if (order?.fulfilled_at)
    return (
      <div className="mx-auto max-w-xl px-5 py-20 text-center">
        <p className="text-sm font-semibold text-accent-600">
          Payment confirmed
        </p>
        <h1 className="mt-3 text-4xl font-bold">{startup.name} is live.</h1>
        <p className="mt-4 text-sm text-bone-500">
          Your paid launch includes no website badge requirement.
        </p>
        {order.placement_status === "needs_scheduling" && (
          <p
            role="status"
            className="mt-4 rounded-xl border border-accent-500/30 p-4 text-sm"
          >
            A placement filled during checkout. Your paid launch is live;{" "}
            <Link href="/support" className="underline">
              contact support
            </Link>{" "}
            with order {order.id} to schedule the remaining placement.
          </p>
        )}
        <div className="mt-8 flex justify-center gap-3">
          <LinkButton href={`/startup/${startup.slug}?launched=1`}>
            View my launch
          </LinkButton>
          <LinkButton href="/dashboard" variant="outline">
            Dashboard
          </LinkButton>
        </div>
      </div>
    );
  if (startup.status === "listed" || startup.launch_paid)
    redirect(`/startup/${startup.slug}`);
  if (startup.status !== "draft") redirect("/dashboard");
  return (
    <div className="mx-auto max-w-7xl px-5 py-12 sm:py-16">
      <LaunchPlans
        startup={startup}
        site={process.env.NEXT_PUBLIC_SITE_URL || "https://saasgrave.org"}
        pendingPayment={!!order && !order.fulfilled_at}
      />
    </div>
  );
}
