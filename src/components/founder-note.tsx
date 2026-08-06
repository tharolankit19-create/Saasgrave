import { Eyebrow } from "@/components/ui";
import { XIcon, LinkedInIcon } from "@/components/brand-icons";

// The founder section — deliberately at the very bottom, after the product has
// made its case. A real 16-year-old, his real face, his real launch. This is
// the authority no template can fake. Drop a photo at FOUNDER_PHOTO.
const FOUNDER_PHOTO = "/founder.jpg";

// Launch-week facts (historical, not live) — honest authority from the public
// build, not a decaying "live" counter.
const LAUNCH = [
  { v: "19k+", l: "LinkedIn impressions" },
  { v: "500+", l: "visited in week one" },
  { v: "20", l: "founders in 6 days" },
];

export function FounderNote() {
  return (
    <section className="mx-auto max-w-4xl px-5 pb-24">
      <div className="overflow-hidden rounded-3xl border border-black/8 bg-ink-900 shadow-card">
        <div className="grid gap-0 md:grid-cols-[300px_1fr]">
          {/* portrait */}
          <div className="relative bg-bone-100 p-8 md:p-9">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={FOUNDER_PHOTO}
              alt="Ankit, founder of Saasgrave"
              className="mx-auto h-40 w-40 rounded-2xl border border-white/10 object-cover shadow-lift md:h-full md:w-full md:rounded-xl"
            />
          </div>

          {/* story */}
          <div className="p-8 md:p-10">
            <Eyebrow>Who built this</Eyebrow>
            <h2 className="text-2xl font-bold tracking-tight text-bone-100 sm:text-3xl">
              Hey — I&apos;m Ankit. I&apos;m 16, and I&apos;ve killed four startups.
            </h2>
            <div className="mt-4 space-y-3 text-[15px] leading-relaxed text-bone-400">
              <p>
                This is the graveyard for those four — and yours. I built it in a weekend with a lot of
                AI and a little desperation, because I couldn&apos;t afford a designer and a squatter
                grabbed saasgrave.com the week I launched.
              </p>
              <p>
                So yeah, it&apos;s a bit rough. But it&apos;s real — and founders are already burying
                their dead projects here instead of quietly deleting them.
              </p>
            </div>

            {/* launch-week authority — historical, honest */}
            <div className="mt-6 grid grid-cols-3 gap-3">
              {LAUNCH.map((s) => (
                <div key={s.l} className="rounded-xl border border-black/8 bg-ink-850 p-3 text-center">
                  <div className="font-mono text-lg font-bold tabular-nums text-bone-100">{s.v}</div>
                  <div className="mt-1 text-[11px] leading-tight text-bone-500">{s.l}</div>
                </div>
              ))}
            </div>
            <p className="mt-2.5 font-mono text-[10px] uppercase tracking-wider text-bone-500">
              First week, building in public
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <a
                href="https://x.com/SaasGrave"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-9 items-center gap-2 rounded-full bg-bone-100 px-4 text-sm font-medium text-white transition hover:bg-[#2b2c33]"
              >
                <XIcon size={13} /> Follow the build
              </a>
              <span className="inline-flex items-center gap-1.5 text-xs text-bone-500">
                <LinkedInIcon size={13} className="text-bone-400" /> Launched in public on LinkedIn
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
