import { Card } from "@/components/ui";
import { XIcon } from "@/components/brand-icons";

// The single most "un-AI" thing on the site: a real 16-year-old founder, in his
// own voice, with his own face. No poetry, no "we", no polish — just the person
// who built it. Drop a real photo at FOUNDER_PHOTO and it replaces the monogram.
const FOUNDER_PHOTO = "/founder.jpg";

export function FounderNote() {
  return (
    <section className="mx-auto max-w-3xl px-5 pb-24">
      <Card className="flex flex-col gap-6 p-7 sm:flex-row sm:p-9">
        {FOUNDER_PHOTO ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={FOUNDER_PHOTO}
            alt="Ankit, founder of Saasgrave"
            className="h-20 w-20 shrink-0 rounded-2xl border border-black/10 object-cover shadow-card sm:h-24 sm:w-24"
          />
        ) : (
          <span className="grid h-20 w-20 shrink-0 place-items-center rounded-2xl border border-black/10 bg-ink-850 font-serif text-3xl text-bone-300 shadow-card sm:h-24 sm:w-24">
            A
          </span>
        )}
        <div>
          <p className="text-[15px] leading-relaxed text-bone-200">
            Hey — I&apos;m Ankit. I&apos;m 16, and I&apos;ve killed four startups.
          </p>
          <p className="mt-3 text-[15px] leading-relaxed text-bone-400">
            This is the graveyard for those four — and yours. I built it in a weekend with a lot of
            AI and a little desperation, because I couldn&apos;t afford a designer and a squatter grabbed
            saasgrave.com the week I launched. So yeah, it&apos;s a bit rough. But it&apos;s real, and
            founders are already burying their dead projects here instead of deleting them.
          </p>
          <p className="mt-3 text-[15px] leading-relaxed text-bone-400">
            If you&apos;ve got something rotting in a private repo — lay it to rest here with the story
            intact, or sell it and keep every dollar. That&apos;s the whole idea.
          </p>
          <div className="mt-5 flex items-center gap-3">
            <a
              href="https://x.com/SaasGrave"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-9 items-center gap-2 rounded-full border border-black/12 bg-ink-900 px-4 text-sm font-medium text-bone-100 shadow-sm transition hover:border-black/25 hover:shadow-card"
            >
              <XIcon size={13} /> Follow the build
            </a>
            <span className="text-xs text-bone-500">Building in public, one dead startup at a time.</span>
          </div>
        </div>
      </Card>
    </section>
  );
}
