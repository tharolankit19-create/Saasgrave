import { Rocket, Sparkles, ArrowUpRight } from "lucide-react";

// "SaasGrave Launches" lives on its own subdomain. A dead listing is only the
// end of one story — these CTAs push the reader toward starting the next one.
const LAUNCH_URL = "https://ls.saasgrave.org";

const primary =
  "inline-flex h-11 items-center justify-center gap-2 rounded-full bg-gradient-to-b from-accent-400 to-accent-500 px-5 text-sm font-medium text-white shadow-glow transition-all duration-200 hover:brightness-[1.04] hover:shadow-lift active:scale-[0.98]";
const secondary =
  "inline-flex h-11 items-center justify-center gap-2 rounded-full border border-black/12 bg-ink-900 px-5 text-sm font-medium text-bone-100 transition-all duration-200 hover:border-black/25 hover:shadow-card active:scale-[0.98]";

/** Full-width CTA for a startup page — aimed at whoever is reading the obituary. */
export function ReviveCta({ name }: { name?: string }) {
  return (
    <div className="rounded-2xl border border-accent-500/25 bg-accent-400/[0.07] p-6 shadow-card sm:p-7">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-4">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-gradient-to-b from-accent-400 to-accent-500 text-white shadow-glow">
            <Rocket size={20} />
          </span>
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-accent-600">
              Saasgrave Launches
            </p>
            <h3 className="mt-1.5 text-xl font-bold tracking-tight text-bone-100">
              {name ? `${name} doesn't have to stay buried.` : "It doesn't have to stay buried."}
            </h3>
            <p className="mt-1 text-sm text-bone-400">
              Someone is going to relaunch it and take the traffic. Make it you.
            </p>
          </div>
        </div>
        <div className="flex shrink-0 flex-wrap gap-2.5">
          <a href={LAUNCH_URL} target="_blank" rel="noopener noreferrer" className={primary}>
            <Rocket size={16} /> Launch your SaaS <ArrowUpRight size={14} />
          </a>
          <a href={LAUNCH_URL} target="_blank" rel="noopener noreferrer" className={secondary}>
            <Sparkles size={16} /> Revive it
          </a>
        </div>
      </div>
    </div>
  );
}

/** Compact banner for the dashboard. */
export function LaunchBanner() {
  return (
    <a
      href={LAUNCH_URL}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center justify-between gap-4 rounded-2xl border border-accent-500/25 bg-accent-400/[0.07] p-5 transition-all duration-200 hover:border-accent-500/40 hover:shadow-card"
    >
      <div className="flex items-center gap-3.5">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gradient-to-b from-accent-400 to-accent-500 text-white shadow-glow">
          <Rocket size={18} />
        </span>
        <div>
          <div className="text-sm font-semibold text-bone-100">Built something new? Launch it.</div>
          <div className="text-xs text-bone-400">
            Get your next SaaS in front of the founders already browsing here.
          </div>
        </div>
      </div>
      <span className="shrink-0 whitespace-nowrap text-sm font-medium text-accent-600">
        Launch your SaaS →
      </span>
    </a>
  );
}
