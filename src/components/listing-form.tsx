"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowLeft, ArrowRight, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui";
import { ImageUpload } from "@/components/image-upload";
import { GalleryUpload } from "@/components/gallery-upload";
import { slugify } from "@/lib/utils";

const CATEGORIES = ["SaaS", "Mobile app", "Chrome extension", "Marketplace", "AI tool", "DevTool", "Consumer", "Other"];
const REASONS = ["No market need", "Ran out of cash", "Competition", "Wrong team", "Bad timing", "Lost focus", "Other"];
const CHANNELS = ["SEO", "Twitter/X", "Cold email", "Product Hunt", "Reddit", "Ads", "Content", "Word of mouth"];

const STEPS = ["The product", "What happened", "Money & sale"];

export function ListingForm() {
  const supabase = createClient();
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [f, setF] = useState({
    name: "",
    logo_url: "",
    screenshot_urls: [] as string[],
    tagline: "",
    about: "",
    category: "SaaS",
    tech_stack: "",
    marketing_channels: [] as string[],
    started_at: "",
    ended_at: "",
    outcome: "shutdown",
    failure_reason: "No market need",
    failure_detail: "",
    lessons_learned: "",
    total_users: "",
    monthly_visitors: "",
    analytics_url: "",
    claimed_mrr: "",
    for_sale: false,
    price_mode: "fixed" as "fixed" | "multiplier" | "offers",
    asking_price: "",
    price_multiplier: "",
  });

  function set<K extends keyof typeof f>(key: K, value: (typeof f)[K]) {
    setF((prev) => ({ ...prev, [key]: value }));
  }

  function toggleChannel(c: string) {
    set(
      "marketing_channels",
      f.marketing_channels.includes(c)
        ? f.marketing_channels.filter((x) => x !== c)
        : [...f.marketing_channels, c]
    );
  }

  function next() {
    if (step === 0 && !f.name.trim()) return toast.error("Your startup needs a name.");
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  }

  async function submit(publish: boolean) {
    setLoading(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setLoading(false);
      return toast.error("Please sign in again.");
    }

    // Make sure a profile row exists — startups.founder_id references it.
    // (Covers users whose row was never created by the signup trigger.)
    await supabase.from("profiles").upsert({ id: user.id }, { onConflict: "id" });

    const slug = `${slugify(f.name)}-${Math.random().toString(36).slice(2, 6)}`;
    const { data, error } = await supabase
      .from("startups")
      .insert({
        founder_id: user.id,
        slug,
        name: f.name.trim(),
        logo_url: f.logo_url.trim() || null,
        screenshot_urls: f.screenshot_urls,
        tagline: f.tagline.trim() || null,
        about: f.about.trim() || null,
        category: f.category,
        tech_stack: f.tech_stack ? f.tech_stack.split(",").map((s) => s.trim()).filter(Boolean) : [],
        marketing_channels: f.marketing_channels,
        started_at: f.started_at || null,
        ended_at: f.ended_at || null,
        outcome: f.outcome,
        failure_reason: f.failure_reason,
        failure_detail: f.failure_detail.trim() || null,
        lessons_learned: f.lessons_learned.trim() || null,
        total_users: Number(f.total_users) || 0,
        monthly_visitors: Number(f.monthly_visitors) || 0,
        analytics_url: f.analytics_url.trim() || null,
        claimed_mrr: Number(f.claimed_mrr) || 0,
        // Pricing is captured up front, but the listing only becomes "for sale"
        // once the $9 fee is paid from the dashboard. So for_sale stays false here.
        for_sale: false,
        asking_price: f.for_sale && f.price_mode === "fixed" ? Number(f.asking_price) || null : null,
        price_multiplier:
          f.for_sale && f.price_mode === "multiplier" ? Number(f.price_multiplier) || null : null,
        open_to_offers: f.for_sale ? f.price_mode === "offers" : false,
        // Publish now → live on the marketplace (free). Otherwise keep as a draft.
        status: publish ? "listed" : "draft",
      })
      .select("id, slug")
      .single();

    if (error) {
      setLoading(false);
      return toast.error(error.message);
    }
    if (publish) {
      toast.success("Your listing is live.");
      router.push(`/startup/${data.slug}`);
    } else {
      toast.success("Saved as a draft — publish it anytime from your dashboard.");
      router.push("/dashboard");
    }
    router.refresh();
  }

  return (
    <div className="rounded-2xl border border-black/8 bg-ink-900/60 p-7">
      {/* progress */}
      <div className="mb-7 flex items-center gap-2">
        {STEPS.map((label, i) => (
          <div key={label} className="flex flex-1 items-center gap-2">
            <div
              className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-medium transition ${
                i <= step ? "bg-ember-600 text-ink-950" : "bg-ink-800 text-bone-500"
              }`}
            >
              {i + 1}
            </div>
            <span className={`text-xs ${i === step ? "text-bone-100" : "text-bone-500"}`}>{label}</span>
            {i < STEPS.length - 1 && <div className="h-px flex-1 bg-black/8" />}
          </div>
        ))}
      </div>

      {/* Step 1 — Identity */}
      {step === 0 && (
        <div className="space-y-4">
          <Text label="Startup name" required value={f.name} onChange={(v) => set("name", v)} placeholder="Acme Analytics" />
          <ImageUpload bucket="logos" label="Logo" hint="optional" value={f.logo_url} onChange={(v) => set("logo_url", v)} />
          <Text label="Tagline" optional value={f.tagline} onChange={(v) => set("tagline", v)} placeholder="One line on what it did." />
          <Area label="About" optional value={f.about} onChange={(v) => set("about", v)} placeholder="What did it do? Who was it for?" />
          <Select label="Category" value={f.category} onChange={(v) => set("category", v)} options={CATEGORIES} />
          <Text label="Tech stack" optional value={f.tech_stack} onChange={(v) => set("tech_stack", v)} placeholder="Next.js, Supabase, Stripe (comma separated)" />
          <div>
            <span className="mb-2 block text-xs font-medium text-bone-500">Marketing channels</span>
            <div className="flex flex-wrap gap-2">
              {CHANNELS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => toggleChannel(c)}
                  className={`rounded-full border px-3 py-1.5 text-xs transition ${
                    f.marketing_channels.includes(c)
                      ? "border-ember-500/50 bg-ember-600/15 text-ember-400"
                      : "border-black/10 text-bone-300 hover:border-black/25"
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
          <GalleryUpload value={f.screenshot_urls} onChange={(v) => set("screenshot_urls", v)} />
        </div>
      )}

      {/* Step 2 — Autopsy */}
      {step === 1 && (
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Text label="Started" type="date" value={f.started_at} onChange={(v) => set("started_at", v)} />
            <Text label="Ended / pivoted" type="date" value={f.ended_at} onChange={(v) => set("ended_at", v)} />
          </div>
          <Select label="Outcome" value={f.outcome} onChange={(v) => set("outcome", v)} options={["shutdown", "pivot"]} />
          <Select label="Why it ended" value={f.failure_reason} onChange={(v) => set("failure_reason", v)} options={REASONS} />
          <Area label="What actually happened" optional value={f.failure_detail} onChange={(v) => set("failure_detail", v)} placeholder="The honest post-mortem." />
          <Area label="Lessons learned" optional value={f.lessons_learned} onChange={(v) => set("lessons_learned", v)} placeholder="What would you tell the next founder?" />
          <div className="grid gap-4 sm:grid-cols-2">
            <Text label="Total users ever" type="number" value={f.total_users} onChange={(v) => set("total_users", v)} />
            <Text label="Monthly visitors" type="number" value={f.monthly_visitors} onChange={(v) => set("monthly_visitors", v)} />
          </div>
          <Text label="Analytics share link" optional value={f.analytics_url} onChange={(v) => set("analytics_url", v)} placeholder="Google Analytics / Plausible public link" />
        </div>
      )}

      {/* Step 3 — Money & sale */}
      {step === 2 && (
        <div className="space-y-5">
          <Text label="Last known MRR ($/mo)" type="number" value={f.claimed_mrr} onChange={(v) => set("claimed_mrr", v)} placeholder="0" />
          <p className="rounded-xl border border-black/8 bg-ink-800/50 p-3 text-xs text-bone-500">
            You can <span className="text-bone-300">verify</span> this revenue from your listing page later
            using a read-only Stripe key — verified numbers get a green badge and sell far better.
          </p>

          <label className="flex cursor-pointer items-center justify-between rounded-xl border border-black/8 bg-ink-800/50 p-4">
            <div>
              <div className="text-sm font-medium text-bone-100">I want to sell this</div>
              <div className="text-xs text-bone-500">Set a price now. It goes on sale once you pay the $9 fee from your dashboard.</div>
            </div>
            <input
              type="checkbox"
              checked={f.for_sale}
              onChange={(e) => set("for_sale", e.target.checked)}
              className="h-5 w-5 accent-accent-500"
            />
          </label>

          {f.for_sale && (
            <div className="space-y-4 rounded-xl border border-ember-500/20 bg-ember-600/[0.04] p-4">
              <div className="flex gap-2">
                {(["fixed", "multiplier", "offers"] as const).map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => set("price_mode", m)}
                    className={`flex-1 rounded-lg border px-3 py-2 text-xs capitalize transition ${
                      f.price_mode === m
                        ? "border-ember-500/50 bg-ember-600/15 text-ember-400"
                        : "border-black/10 text-bone-300 hover:border-black/25"
                    }`}
                  >
                    {m === "fixed" ? "Fixed price" : m === "multiplier" ? "Revenue multiple" : "Open to offers"}
                  </button>
                ))}
              </div>
              {f.price_mode === "fixed" && (
                <Text label="Asking price ($)" type="number" value={f.asking_price} onChange={(v) => set("asking_price", v)} placeholder="2000" />
              )}
              {f.price_mode === "multiplier" && (
                <>
                  <Text label="Multiplier (× last revenue)" type="number" value={f.price_multiplier} onChange={(v) => set("price_multiplier", v)} placeholder="3" />
                  <p className="text-xs text-bone-500">
                    At {f.price_multiplier || "3"}× your ${f.claimed_mrr || "0"}/mo, that&apos;s roughly{" "}
                    <span className="text-ember-400">
                      ${((Number(f.price_multiplier) || 0) * (Number(f.claimed_mrr) || 0)).toLocaleString()}
                    </span>
                    .
                  </p>
                </>
              )}
              <p className="text-xs text-bone-500">
                Listing a startup is free. Listing it <span className="text-bone-300">for sale</span> is a
                one-time <span className="text-bone-300">$9</span> fee, paid from your dashboard.
              </p>
            </div>
          )}
        </div>
      )}

      {/* nav */}
      <div className="mt-8 flex items-center justify-between">
        <button
          type="button"
          onClick={() => setStep((s) => Math.max(0, s - 1))}
          disabled={step === 0}
          className="inline-flex items-center gap-1.5 text-sm text-bone-500 transition hover:text-bone-300 disabled:opacity-0"
        >
          <ArrowLeft size={15} /> Back
        </button>
        {step < STEPS.length - 1 ? (
          <Button onClick={next}>
            Continue <ArrowRight size={15} />
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => submit(false)} disabled={loading}>
              Save as draft
            </Button>
            <Button onClick={() => submit(true)} disabled={loading}>
              {loading ? <Loader2 size={16} className="animate-spin" /> : "Publish free"}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

/* ── field primitives ─────────────────────────────────────── */
function Text({
  label, value, onChange, placeholder, type = "text", required, optional,
}: {
  label: string; value: string; onChange: (v: string) => void;
  placeholder?: string; type?: string; required?: boolean; optional?: boolean;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 flex text-xs font-medium text-bone-500">
        {label}
        {optional && <span className="ml-auto text-bone-500/60">optional</span>}
      </span>
      <input
        type={type}
        value={value}
        required={required}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-11 w-full rounded-xl border border-black/10 bg-ink-900 px-4 text-sm text-bone-100 placeholder:text-bone-500/60 outline-none transition focus:border-ember-500/50 [color-scheme:dark]"
      />
    </label>
  );
}

function Area({
  label, value, onChange, placeholder, optional,
}: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string; optional?: boolean;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 flex text-xs font-medium text-bone-500">
        {label}
        {optional && <span className="ml-auto text-bone-500/60">optional</span>}
      </span>
      <textarea
        value={value}
        rows={3}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-black/10 bg-ink-900 p-4 text-sm text-bone-100 placeholder:text-bone-500/60 outline-none transition focus:border-ember-500/50"
      />
    </label>
  );
}

function Select({
  label, value, onChange, options,
}: {
  label: string; value: string; onChange: (v: string) => void; options: string[];
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium text-bone-500">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-11 w-full rounded-xl border border-black/10 bg-ink-900 px-4 text-sm text-bone-100 outline-none transition focus:border-ember-500/50 capitalize"
      >
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </label>
  );
}
