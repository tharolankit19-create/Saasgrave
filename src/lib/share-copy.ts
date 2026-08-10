/**
 * The post we hand a founder after they publish a listing.
 *
 * Written per-platform on purpose. The two networks reward completely
 * different shapes: X rewards a tight hook with the payoff in three lines,
 * LinkedIn rewards a confession that unfolds over several short paragraphs and
 * punishes anything that reads like an ad in the first two lines. Handing the
 * same block of text to both is how a launch post dies twice.
 */

export type SharePlatform = "x" | "linkedin";

export type ShareInput = {
  name: string;
  tagline?: string | null;
  url: string;
  forSale?: boolean;
};

/**
 * X: short, no wind-up, the whole idea visible without a "show more".
 * The strongest-performing shape is a flat confession followed by the reversal.
 */
function forX({ name, tagline, url, forSale }: ShareInput): string {
  const sub = tagline ? `\n\n"${tagline}"` : "";

  if (forSale) {
    return `I'm selling ${name}. 💀

It didn't take off. But the code still runs, the domain is still aged, and the users are still real.

Deleting all that would be the actual failure.${sub}

Whole thing's up here 👇
${url}`;
  }

  return `I killed ${name}. 💀

Most founders delete the repo and never mention it again.

I published the autopsy instead — the code, the domain, the users, and exactly what went wrong.${sub}

Someone else can pick it up now 👇
${url}`;
}

/**
 * LinkedIn: the confession has room to breathe. Short paragraphs, no link and
 * no ask until the very end — the first three lines are all the feed shows,
 * and anything that smells like promotion there kills the reach.
 */
function forLinkedIn({ name, tagline, url, forSale }: ShareInput): string {
  const sub = tagline ? `\n\n"${tagline}"` : "";

  if (forSale) {
    return `I'm selling ${name}. 💀

I built it. It didn't take off.

But the code still runs. The domain is still aged. The users are still real.

Deleting all of that would be the actual failure — not the fact that it didn't work.

So I've put the whole thing up: the codebase, the domain, the users, and an honest post-mortem of exactly what went wrong.${sub}

Someone out there is going to buy this and make it work.

Maybe that's you 👇

${url}`;
  }

  return `I killed ${name}. 💀

Months of nights and weekends. Then it quietly stopped working.

Most founders delete the repo, let the domain lapse, and never mention it again — like it never happened.

I did the opposite.

I published everything: the code, the domain, the users, and an honest post-mortem of what actually went wrong.

Because a dead startup isn't worth nothing. It's worth something to whoever's willing to pick it up.${sub}

Full autopsy 👇

${url}`;
}

export function shareCopy(platform: SharePlatform, input: ShareInput): string {
  return platform === "x" ? forX(input) : forLinkedIn(input);
}

/**
 * X accepts prefilled text, so a founder can go straight to a composer that's
 * already written. LinkedIn's share endpoint only accepts a URL — the text has
 * to be pasted — which is why the UI copies it first.
 */
export function shareHref(platform: SharePlatform, input: ShareInput): string {
  if (platform === "x") {
    return `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareCopy("x", input))}`;
  }
  return `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(input.url)}`;
}
