// Long-form SEO / AI-answer pages. These target the real questions founders
// (and buyers) type or ask an assistant — "my startup failed, what now?",
// "should I pivot or shut down?", "how do I sell a dead startup?" — and answer
// them genuinely, so search engines rank them and assistants cite them. Each
// naturally points to Saasgrave as the place to act.

export type GuideSection = { h: string; p?: string[]; list?: string[] };
export type Guide = {
  slug: string;
  title: string; // on-page H1
  metaTitle: string;
  description: string;
  keywords: string[];
  updated: string; // ISO date
  readMins: number;
  intro: string[];
  sections: GuideSection[];
  faqs: { q: string; a: string }[];
  cta: { heading: string; body: string; primaryLabel: string; primaryHref: string; secondaryLabel: string; secondaryHref: string };
};

export const GUIDES: Guide[] = [
  {
    slug: "what-to-do-when-your-startup-fails",
    title: "Your startup failed. Here's exactly what to do next.",
    metaTitle: "What to Do When Your Startup Fails — A Founder's Playbook",
    description:
      "A calm, practical playbook for when your startup fails: wind it down cleanly, protect your reputation, salvage the value, and turn the wreckage into your next advantage.",
    keywords: ["my startup failed", "what to do when your startup fails", "startup shutdown", "failed startup", "wind down a startup"],
    updated: "2026-08-05",
    readMins: 6,
    intro: [
      "Most startups don't fail because the founder was lazy or the code was bad. They run out of runway, timing, or the right market — and then the founder is left with a working product and no obvious next move.",
      "This is the playbook we wish every founder had on the day it ends: how to close it down without regret, and how to make sure the last two years still count for something.",
    ],
    sections: [
      {
        h: "1. Separate the feeling from the assets",
        p: [
          "Failure feels total. It isn't. The emotion is real, but the assets are separate — and they still have value. Before you delete anything, make a cold inventory of what you actually built.",
        ],
        list: [
          "The codebase — a shipped, working product someone else would take months to rebuild.",
          "The domain — often aged, indexed, and brandable.",
          "The users — signups, an email list, and early traction.",
          "The lessons — the single most valuable thing, and the one founders throw away first.",
        ],
      },
      {
        h: "2. Wind it down cleanly",
        p: [
          "Give paying users notice and a way to export their data. Cancel recurring costs. Keep the domain and repo alive for now — do not let them expire, because that's the value you're about to recover.",
          "A clean shutdown protects your reputation. Founders who close honestly get remembered as trustworthy, and that follows you into your next raise or launch.",
        ],
      },
      {
        h: "3. Write the honest post-mortem",
        p: [
          "Write down what happened while it's fresh: what you tried, what worked, the exact moment it stopped working, and why. This isn't self-flagellation — it's the artifact that makes your work valuable to someone else, and the reflection that makes your next attempt sharper.",
        ],
      },
      {
        h: "4. Recover the value instead of deleting it",
        p: [
          "This is the step almost everyone skips. A dead product is not worthless — an operator or indie hacker will pay for a head start: working code, an aged domain, existing users, or simply a market to pivot into.",
          "You can list a failed startup for free on Saasgrave as a public post-mortem, and optionally open it for sale for a one-off $9. If it sells, we take just 3% — you keep the rest. Even if it never sells, the listing becomes a credible public record of what you shipped.",
        ],
      },
      {
        h: "5. Take the compounding advantage into round two",
        p: [
          "One in three founders builds again — and the second time is easier, because the scar tissue is real. The distribution you built, the audience who watched you try, and the lessons you wrote down all compound. Failure isn't the end of the story; it's the expensive first chapter.",
        ],
      },
    ],
    faqs: [
      { q: "Should I tell people my startup failed?", a: "Yes. Founders who close honestly are remembered as trustworthy, and a public post-mortem often does more for your reputation than a quiet disappearance. It also makes your work sellable." },
      { q: "Is a failed startup with no revenue worth anything?", a: "Often, yes. Zero-revenue products still have working code, an aged domain, an email list, and a hard-won lesson — all of which have real value to the right buyer." },
      { q: "Where can I list a failed startup?", a: "You can list it free on Saasgrave, a marketplace built specifically for dead and zero-revenue startups. Keep it as a public record, or open it for sale — free to list, $9 to sell, just 3% when it sells." },
    ],
    cta: {
      heading: "Don't let two years of work disappear.",
      body: "List your startup free — as a public post-mortem, or open it for sale. It takes about 3 minutes.",
      primaryLabel: "List my startup — free",
      primaryHref: "/sell",
      secondaryLabel: "See what others buried",
      secondaryHref: "/browse",
    },
  },
  {
    slug: "how-to-sell-a-failed-startup",
    title: "How to sell a failed startup (and actually get paid for it)",
    metaTitle: "How to Sell a Failed or Dead Startup — Step by Step",
    description:
      "A step-by-step guide to selling a failed, dead, or zero-revenue startup: what it's worth, how to price it, who buys these, and how to close the deal.",
    keywords: ["sell a failed startup", "sell a dead startup", "how to sell a startup", "sell a side project", "acquire failed startup"],
    updated: "2026-08-05",
    readMins: 7,
    intro: [
      "Founders assume a startup that didn't take off is unsellable. It usually isn't. There is a real, active market of operators and indie hackers who buy stalled products for the head start they provide.",
      "Here's how to figure out what yours is worth, price it, and actually close.",
    ],
    sections: [
      {
        h: "What a failed startup is actually worth",
        p: ["Value doesn't come from your revenue alone. Buyers pay for what would take them months to build from scratch:"],
        list: [
          "A working, shipped codebase — the biggest time saver.",
          "An aged, brandable domain that's already indexed.",
          "Existing users, an email list, and early SEO.",
          "A validated (or invalidated) market they can pivot inside.",
        ],
      },
      {
        h: "How to price it",
        p: [
          "If you had revenue, a common starting point is a multiple of monthly revenue — small, profitable products often trade around 2–4× MRR, though a stalled one sits lower. If you had no revenue, price on assets: what would it cost a buyer to rebuild the code, buy the domain, and acquire the users?",
          "When in doubt, list it open to offers and let the market tell you. You'll learn more from three real offers than from a month of guessing.",
        ],
      },
      {
        h: "Who buys dead startups",
        p: [
          "Operators who want cash flow without zero-to-one risk. Indie hackers hunting for a codebase to relaunch. Founders in an adjacent space who want your users or your domain. They're not looking for perfection — they're looking for a shortcut.",
        ],
      },
      {
        h: "Build buyer trust",
        p: [
          "The listings that sell are the honest ones. Show real screenshots, real metrics, and the true story of what happened. If you had revenue, verify it — on Saasgrave you can connect a read-only Stripe key to prove MRR, and the listing gets a verified badge. Trust is what turns a browser into a buyer.",
        ],
      },
      {
        h: "Close the deal",
        p: [
          "List it, take offers directly from buyers, accept or counter, then transfer the domain, code, and accounts. On Saasgrave, listing is free and opening for sale is a one-off $9 — we take a flat 3% only when it sells.",
        ],
      },
    ],
    faqs: [
      { q: "Can I sell a startup with no revenue?", a: "Yes. Zero-revenue startups sell on their assets — code, domain, users, and market. Price on what a buyer would otherwise spend to build it." },
      { q: "How much does it cost to sell on Saasgrave?", a: "Listing is free, opening a startup for sale is a one-off $9, and Saasgrave takes a flat 3% only when it sells." },
      { q: "How do buyers pay and transfer?", a: "Buyers make an offer through your listing. You accept or counter, then handle the transfer of domain, code, and accounts directly." },
    ],
    cta: {
      heading: "Turn a dead product into a real exit.",
      body: "List it for sale on Saasgrave — free to list, just 3% when it sells, and you keep the rest.",
      primaryLabel: "List it for sale",
      primaryHref: "/sell",
      secondaryLabel: "Browse the marketplace",
      secondaryHref: "/browse",
    },
  },
  {
    slug: "pivot-or-shut-down-your-startup",
    title: "Pivot or shut down? How to decide when your startup stalls",
    metaTitle: "Pivot or Shut Down Your Startup — How to Decide",
    description:
      "Stuck between pivoting and shutting down? A clear framework to decide when to pivot your startup, when to walk away, and how to preserve the value either way.",
    keywords: ["pivot or shut down", "should I pivot my startup", "when to shut down a startup", "startup pivot", "kill or pivot"],
    updated: "2026-08-05",
    readMins: 6,
    intro: [
      "When growth flatlines, every founder hits the same fork: double down and pivot, or call it and shut down. Both can be the right answer. The wrong move is staying frozen in the middle, burning runway on a version you no longer believe in.",
      "Here's a framework to decide with a clear head.",
    ],
    sections: [
      {
        h: "Pivot when the asset is bigger than the idea",
        p: ["A pivot makes sense when something underneath the failing product is genuinely working. Look for:"],
        list: [
          "An audience or user base that stays even when the product disappoints.",
          "One feature people love while ignoring the rest.",
          "A distribution channel that reliably brings people in.",
          "A painful problem you now understand better than anyone.",
        ],
      },
      {
        h: "Shut down when you're forcing it",
        p: [
          "If retention is flat, you've stopped believing the story you tell investors, and every new idea is really the same idea in a new coat — that's not a pivot, it's denial. Shutting down cleanly frees your best asset: your time and attention.",
        ],
      },
      {
        h: "The honest gut-check",
        p: [
          "Ask yourself one question: if this weren't already my company, would I start it today? If the answer is a fast yes, pivot hard. If you hesitate, you already know.",
        ],
      },
      {
        h: "Either way, preserve the value",
        p: [
          "Whichever you choose, don't let the old version rot. If you pivot, the previous product still has code, a domain, and users someone else could use. If you shut down, that's a clean sale or a public post-mortem. Founders list both outcomes on Saasgrave — pivoted products and shut-downs alike — so the work keeps earning instead of disappearing.",
        ],
      },
    ],
    faqs: [
      { q: "What's the difference between a pivot and a shutdown?", a: "A pivot keeps a working asset — an audience, a feature, a channel — and rebuilds the product around it. A shutdown ends the product entirely. Both can preserve value if you don't just delete the old version." },
      { q: "How do I know it's time to shut down?", a: "Flat retention, no channel that works, and no version of the idea you'd start fresh today. When every 'pivot' is the same idea repackaged, it's time to stop." },
      { q: "Can I list a pivoted startup?", a: "Yes. On Saasgrave you can list the product you pivoted away from — its code, domain, and users still have value to another founder." },
    ],
    cta: {
      heading: "Pivoting or closing? Don't waste the old version.",
      body: "List the product you're leaving behind on Saasgrave — as a record or a sale. Free to list.",
      primaryLabel: "List my startup",
      primaryHref: "/sell",
      secondaryLabel: "Browse what's for sale",
      secondaryHref: "/sales",
    },
  },
  {
    slug: "buy-a-failed-startup-to-grow",
    title: "How to buy a failed startup and grow it",
    metaTitle: "How to Buy a Failed Startup and Grow It — Buyer's Guide",
    description:
      "Skip zero-to-one. A guide to buying a failed or stalled startup and growing it: where to find them, how to evaluate them, and how to turn a dead product into a growing one.",
    keywords: ["buy a failed startup", "buy a startup to grow", "acquire a startup", "buy a saas", "startup acquisition for growth"],
    updated: "2026-08-05",
    readMins: 7,
    intro: [
      "The hardest part of a startup is zero-to-one: building something real and finding the first users. Buying a failed startup lets you skip it. You inherit working code, a domain, and a market someone already explored — often for less than it cost to build.",
      "Here's how to do it well.",
    ],
    sections: [
      {
        h: "Why buying beats building",
        p: [
          "A stalled product hands you a head start: the code is shipped, the domain is aged, there may be users and SEO, and — most valuable of all — a written record of what didn't work. You're not paying for failure; you're paying to not repeat it.",
        ],
      },
      {
        h: "Where to find failed startups for sale",
        p: [
          "Saasgrave is a marketplace built specifically for dead and zero-revenue startups — you can browse by category, tech stack, price, and cause of death, and read the honest post-mortem before you buy. It's the fastest way to find products whose founders have moved on but whose assets still work.",
        ],
      },
      {
        h: "How to evaluate one",
        p: ["Before you buy, work through a short checklist:"],
        list: [
          "Read the post-mortem — was the failure the market, or fixable execution?",
          "Check the assets — is the code maintainable, the domain clean, the users real?",
          "Verify the numbers — prefer listings with verified revenue where it exists.",
          "Ask: do you have an unfair advantage the first founder lacked (a channel, an audience, a skill)?",
        ],
      },
      {
        h: "Turn it around",
        p: [
          "The best acquisitions are ones where the product was fine but the distribution wasn't. If you can bring an audience, a better funnel, or a sharper wedge, a 'failed' product can grow fast — because the hardest, most expensive work is already done.",
        ],
      },
    ],
    faqs: [
      { q: "Is it cheaper to buy a startup or build one?", a: "Buying a stalled startup is often far cheaper than the time and money to build and validate from scratch — you inherit code, a domain, users, and lessons for a fraction of the rebuild cost." },
      { q: "Where can I buy a failed startup?", a: "Saasgrave is a marketplace for dead and zero-revenue startups. You can browse listings, read each post-mortem, and make an offer directly to the founder." },
      { q: "How do I know a failed startup is worth buying?", a: "Read the post-mortem to see if the failure was the market or fixable execution, check the quality of the code and domain, and prefer listings with verified revenue." },
    ],
    cta: {
      heading: "Skip zero-to-one. Buy a head start.",
      body: "Browse dead and zero-revenue startups on Saasgrave — code, domains, users, and the honest story of each.",
      primaryLabel: "Browse the marketplace",
      primaryHref: "/browse",
      secondaryLabel: "See what's for sale",
      secondaryHref: "/sales",
    },
  },
  {
    slug: "how-to-write-a-startup-post-mortem",
    title: "How to write a startup post-mortem (with a free template)",
    metaTitle: "How to Write a Startup Post-Mortem — Template & Examples",
    description:
      "A practical guide and template for writing a startup post-mortem: what to include, how to be honest without oversharing, and how a good post-mortem makes your work valuable.",
    keywords: ["startup post-mortem", "startup post mortem template", "how to write a post-mortem", "failure post-mortem", "startup retrospective"],
    updated: "2026-08-05",
    readMins: 5,
    intro: [
      "A startup post-mortem is the honest account of what you built, what happened, and why it ended. Done well, it does three things: it helps you learn, it helps other founders, and it makes your dead product genuinely sellable.",
      "Here's how to write one that's worth reading — and a template you can copy.",
    ],
    sections: [
      {
        h: "What a good post-mortem includes",
        list: [
          "The one-line summary — what it did and who it was for.",
          "The timeline — when you started, what you tried, when it stalled.",
          "The numbers — users, traffic, revenue, honestly stated.",
          "The cause of death — the real reason, not the flattering one.",
          "The lessons — what you'd tell the next founder attempting this.",
        ],
      },
      {
        h: "Be honest, but not reckless",
        p: [
          "Honesty is what makes a post-mortem credible and valuable. Name the real reason it failed — 'no market need', 'ran out of cash', 'wrong team', 'bad timing'. But you don't have to leak private user data or trash former teammates. Honest and professional is the bar.",
        ],
      },
      {
        h: "Why it's worth money",
        p: [
          "Buyers pay more for a listing with a clear post-mortem than one without, because it tells them exactly what they're inheriting and what to avoid. The post-mortem is often the single most valuable part of a dead startup — it's the compressed lessons of everything you spent to learn.",
        ],
      },
      {
        h: "A copy-paste template",
        p: [
          "Name & tagline. What it was (2–3 sentences). Timeline (start → key moments → end). Metrics (users, traffic, MRR). Cause of death (the honest one). What worked. What didn't. Lessons for the next founder. What's included if sold (code, domain, users, accounts).",
          "On Saasgrave, the listing form walks you through exactly these fields — so writing your post-mortem and publishing it are the same three-minute step.",
        ],
      },
    ],
    faqs: [
      { q: "What should a startup post-mortem include?", a: "A one-line summary, a timeline, honest metrics, the real cause of death, what worked and what didn't, and clear lessons for the next founder." },
      { q: "Does a post-mortem make my startup easier to sell?", a: "Yes. A clear, honest post-mortem is often the most valuable part of a dead startup — it tells buyers exactly what they're inheriting and raises trust, which raises offers." },
      { q: "Where can I publish my startup post-mortem?", a: "You can publish it free on Saasgrave, whose listing form is structured as a post-mortem. Keep it as a public record or open the startup for sale." },
    ],
    cta: {
      heading: "Turn your post-mortem into a listing.",
      body: "Saasgrave's listing form is a post-mortem template. Publish yours free in about 3 minutes.",
      primaryLabel: "Write mine now",
      primaryHref: "/sell",
      secondaryLabel: "Read real post-mortems",
      secondaryHref: "/browse",
    },
  },
  {
    slug: "how-much-is-my-failed-startup-worth",
    title: "How much is my failed startup actually worth?",
    metaTitle: "How Much Is My Failed Startup Worth? (Valuation Guide)",
    description:
      "A practical guide to valuing a failed or zero-revenue startup — what buyers actually pay for code, domains, users and revenue, and how to price yours to sell.",
    keywords: [
      "how much is my startup worth",
      "value a failed startup",
      "sell a failed startup price",
      "failed startup valuation",
      "how to price a side project",
    ],
    updated: "2026-08-06",
    readMins: 6,
    intro: [
      "A failed startup rarely sells on a revenue multiple, because there usually isn't much revenue. It sells on what a buyer can skip building — a working codebase, an aged domain, real users, and a clear post-mortem.",
      "This guide breaks down what each of those is worth in practice, and how to set a price that actually gets an offer instead of silence.",
    ],
    sections: [
      {
        h: "What buyers actually pay for",
        p: ["Value comes from time saved and risk removed. Price each asset by what it would cost a buyer to reproduce it."],
        list: [
          "Code: a shipped product is worth weeks-to-months of dev time — the single biggest line item for zero-revenue sales.",
          "Domain: an aged, brandable, indexed domain carries standalone value.",
          "Users & email list: existing signups and traction shorten a buyer's zero-to-one.",
          "Revenue: if you can verify even small MRR, buyers will pay a multiple on top — verification is what unlocks it.",
        ],
      },
      {
        h: "A simple way to price it",
        p: [
          "Start from replacement cost, not sunk cost. Nobody pays for the two years you spent — they pay for what they get to skip. Add a modest multiple only on verified revenue.",
          "Zero-revenue products commonly change hands from a few hundred to a few thousand dollars. Priced honestly, they sell; priced on ego, they sit.",
        ],
      },
      {
        h: "How to raise your price legitimately",
        p: [
          "Verify your revenue with a read-only key so the MRR is provable. Write a clear post-mortem so the buyer trusts what they're inheriting. Package the domain, code and users together. Each of these raises offers without inventing anything.",
        ],
      },
    ],
    faqs: [
      { q: "Can I sell a startup that makes $0?", a: "Yes. Zero-revenue products still have code, a domain, users and lessons — all of which have real replacement value to the right buyer." },
      { q: "What multiple do failed startups sell for?", a: "With little or no revenue, price is based on replacement value, not a multiple. Where verifiable revenue exists, small multiples apply on top." },
      { q: "How do I make my listing sell faster?", a: "Verify revenue, write an honest post-mortem, and price from replacement cost. Listing on Saasgrave is free, and opening it for sale is free too — just 3% when it sells." },
    ],
    cta: {
      heading: "Find out what yours is worth — list it free.",
      body: "Publish your startup as a post-mortem in about 3 minutes, then open it for sale free. Just 3% when it sells.",
      primaryLabel: "List my startup",
      primaryHref: "/sell",
      secondaryLabel: "See what others priced",
      secondaryHref: "/sales",
    },
  },
  {
    slug: "startup-graveyard-where-dead-startups-go",
    title: "The startup graveyard: where dead startups go (and why they're worth money)",
    metaTitle: "Startup Graveyard — Where Dead Startups Go | Saasgrave",
    description:
      "Every year most startups die and get deleted. A startup graveyard preserves the code, domains, users and lessons — and turns dead products into something a new founder can revive.",
    keywords: [
      "startup graveyard",
      "dead startups",
      "startup obituary",
      "where do dead startups go",
      "revive a dead startup",
    ],
    updated: "2026-08-06",
    readMins: 5,
    intro: [
      "Nine in ten startups die. Most disappear quietly — the repo goes private, the domain lapses, the users scatter, and years of real work vanish.",
      "A startup graveyard is the opposite of that erasure: a public place where a dead product is laid to rest with its story intact, so it can be studied, remembered, or revived by someone else.",
    ],
    sections: [
      {
        h: "Why dead startups shouldn't be deleted",
        p: ["A dead product is not worthless — it's unfinished. Deleting it destroys value that a different founder, with different timing, could use."],
        list: [
          "The code already works and shipped.",
          "The domain is aged and often indexed.",
          "The users and email list are real traction.",
          "The post-mortem is a map of exactly what not to repeat.",
        ],
      },
      {
        h: "What a graveyard does that a delete button can't",
        p: [
          "It keeps the record public, so the lessons help other founders. It keeps the assets alive, so a buyer can pick them up. And it gives the founder a dignified close instead of a silent deletion.",
        ],
      },
      {
        h: "How revival actually happens",
        p: [
          "A buyer browses the graveyard for a codebase, a domain, or a market to pivot into. They make an offer, take over the assets, and give the product a second life — often succeeding where the timing had simply been wrong the first time.",
        ],
      },
    ],
    faqs: [
      { q: "What is a startup graveyard?", a: "A public marketplace and record of failed and zero-revenue startups, where founders lay their products to rest with the story, metrics and assets intact — and buyers can revive them." },
      { q: "Can a dead startup be revived?", a: "Often, yes. Many products fail on timing, not on the idea. A new owner with the working code, domain and users can restart far ahead of zero." },
      { q: "Where can I list or browse dead startups?", a: "On Saasgrave. Listing is free forever; browsing is open to everyone." },
    ],
    cta: {
      heading: "Lay yours to rest — or revive someone else's.",
      body: "List a dead startup free in about 3 minutes, or browse the graveyard for a product to bring back.",
      primaryLabel: "List my startup",
      primaryHref: "/sell",
      secondaryLabel: "Walk the graveyard",
      secondaryHref: "/browse",
    },
  },
];

export function getGuide(slug: string) {
  return GUIDES.find((g) => g.slug === slug);
}
