import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { PRODUCTS, productDodoId, type ProductKey } from "@/lib/ad-pricing";
import { createDodoCheckout } from "@/lib/dodo";

const schema = z.object({
  startupId: z.string().uuid(),
  product: z.enum([
    "featured",
    "sidebar",
    "sponsored",
    "newsletter",
    "directory",
    "bundle",
  ]),
});
export async function POST(req: Request) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    return NextResponse.json(
      { error: "Please sign in again." },
      { status: 401 },
    );
  const body = schema.safeParse(await req.json().catch(() => null));
  if (!body.success)
    return NextResponse.json(
      { error: "Choose a valid launch plan." },
      { status: 400 },
    );
  const { startupId, product } = body.data;
  const { data: startup } = await supabase
    .from("startups")
    .select("id, status, launch_paid")
    .eq("id", startupId)
    .eq("founder_id", user.id)
    .single();
  if (!startup || !["draft", "listed"].includes(startup.status))
    return NextResponse.json({ error: "Listing not found." }, { status: 404 });
  if (startup.launch_paid)
    return NextResponse.json(
      { error: "This product already has a paid launch. Open your dashboard." },
      { status: 409 },
    );
  const productId = productDodoId(product);
  if (!productId)
    return NextResponse.json(
      {
        error:
          "This plan is temporarily unavailable. Your draft is saved; choose another plan or launch free.",
      },
      { status: 503 },
    );
  try {
    const admin = createAdminClient();
    // Reuse an in-flight checkout for this product, including double-clicks
    // and a lost HTTP response. Old sessions can be replaced after a day.
    await admin
      .from("launch_orders")
      .update({ status: "failed" })
      .eq("startup_id", startupId)
      .eq("user_id", user.id)
      .eq("product", product)
      .eq("status", "pending")
      .lt("created_at", new Date(Date.now() - 86400000).toISOString());
    const { data: existing } = await admin
      .from("launch_orders")
      .select("id, checkout_url")
      .eq("startup_id", startupId)
      .eq("user_id", user.id)
      .eq("product", product)
      .eq("status", "pending")
      .maybeSingle();
    if (existing?.checkout_url)
      return NextResponse.json({ url: existing.checkout_url });
    if (existing)
      return NextResponse.json(
        { error: "Your checkout is being prepared. Wait a moment and retry." },
        { status: 409 },
      );
    // Fail before charging when the persisted order cannot be created.
    const { data: order, error } = await admin
      .from("launch_orders")
      .insert({
        startup_id: startupId,
        user_id: user.id,
        product,
        product_id: productId,
        amount_cents: PRODUCTS[product as ProductKey].dollars * 100,
      })
      .select("id")
      .single();
    if (error || !order) throw new Error("Order unavailable");
    const site = process.env.NEXT_PUBLIC_SITE_URL || new URL(req.url).origin;
    let url: string;
    try {
      url = await createDodoCheckout({
        kind: "launch",
        referenceId: startupId,
        userId: user.id,
        email: user.email,
        productId,
        orderId: order.id,
        successUrl: `${site}/launch/${startupId}?order=${order.id}`,
      });
    } catch (error) {
      await admin
        .from("launch_orders")
        .update({ status: "failed" })
        .eq("id", order.id);
      throw error;
    }
    const { error: urlError } = await admin
      .from("launch_orders")
      .update({ checkout_url: url })
      .eq("id", order.id);
    if (urlError) throw new Error("Checkout could not be saved");
    return NextResponse.json({ url });
  } catch (error) {
    console.error("launch checkout:", error);
    return NextResponse.json(
      {
        error:
          "Checkout couldn't start. Your draft is saved. Please retry or choose free launch.",
      },
      { status: 503 },
    );
  }
}
