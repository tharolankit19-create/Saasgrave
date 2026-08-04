import Link from "next/link";
import { Bell, Bookmark, Handshake, Store } from "lucide-react";
import { loadGraveyard } from "@/lib/stats";
import { LogoMark } from "@/components/logo";
import { money } from "@/lib/utils";

// The persuasion half of the auth screen. Real numbers, real reasons — this is
// what turns a browser into an account. Shown beside the form on wide screens.
export async function AuthAside({ mode }: { mode: "login" | "register" }) {
  const { stats } = await loadGraveyard(200);
  const isRegister = mode === "register";

  const benefits = [
    { icon: <Bell size={15} />, title: "Death alerts", body: "Get pinged when a product in your niche or stack gets buried — reach the code, domain and users first." },
    { icon: <Bookmark size={15} />, title: "Watchlist", body: "Save the graves you're eyeing and follow price drops and new offers." },
    { icon: <Handshake size={15} />, title: "Make offers", body: "Message founders and bid directly. No middleman, no commission." },
    { icon: <Store size={15} />, title: "List in minutes", body: "Turn a dead repo into a public post-mortem — or a clean sale." },
  ];

  return (
    <div className="relative hidden overflow-hidden border-r border-black/8 bg-ink-900 lg:flex lg:flex-col lg:justify-between lg:p-12">
      <div className="grave-grid pointer-events-none absolute inset-0 opacity-70" />
      <div className="pointer-events-none absolute -left-24 top-1/3 h-72 w-72 rounded-full bg-accent-600/10 blur-3xl" />

      <div className="relative">
        <Link href="/" className="inline-flex items-center gap-2.5">
          <LogoMark className="h-8 w-8" />
          <span className="text-lg font-semibold tracking-tight text-bone-100">
            Saas<span className="text-bone-500">grave</span>
          </span>
        </Link>

        <h2 className="mt-12 max-w-sm font-serif text-3xl leading-tight tracking-tight text-bone-100">
          {isRegister ? "Browsing is free. The good stuff needs an account." : "Your graveyard, your offers, your alerts."}
        </h2>
        <p className="mt-3 max-w-sm text-sm leading-relaxed text-bone-500">
          Anyone can look. An account is what lets you act on what you find — and give your own work a second life.
        </p>

        <ul className="mt-9 max-w-sm space-y-4">
          {benefits.map((b) => (
            <li key={b.title} className="flex gap-3.5">
              <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-black/10 text-accent-400">
                {b.icon}
              </span>
              <span>
                <span className="block text-sm font-medium text-bone-100">{b.title}</span>
                <span className="block text-xs leading-relaxed text-bone-500">{b.body}</span>
              </span>
            </li>
          ))}
        </ul>
      </div>

      {stats.graves > 0 && (
        <div className="relative mt-12 flex flex-wrap gap-x-8 gap-y-3 border-t border-black/8 pt-6">
          <Stat k={stats.graves.toLocaleString("en-US")} v="startups at rest" />
          {stats.founders > 0 && <Stat k={stats.founders.toLocaleString("en-US")} v="founders" />}
          {stats.buriedMrr > 0 && <Stat k={`${money(stats.buriedMrr)}/mo`} v="revenue buried" />}
          {stats.forSale > 0 && <Stat k={stats.forSale.toLocaleString("en-US")} v="up for sale" />}
        </div>
      )}
    </div>
  );
}

function Stat({ k, v }: { k: string; v: string }) {
  return (
    <div>
      <div className="font-serif text-xl text-bone-100">{k}</div>
      <div className="text-xs text-bone-500">{v}</div>
    </div>
  );
}
