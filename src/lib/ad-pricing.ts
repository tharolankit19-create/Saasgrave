// ─── Promotion catalogue ────────────────────────────────────
// Four placements, each a flat price for a 30-day run. Every one carries a
// dofollow link back to the buyer's site. Prices are fixed per placement (no
// auctions, no CPC) — what rises is scarcity, since the slot counts are hard caps.

export type Placement = "featured" | "sidebar" | "sponsored" | "newsletter";

export type PlacementSpec = {
  key: Placement;
  name: string;
  dollars: number;
  /** Hard cap on how many of this placement can ever be sold at once. */
  slots: number;
  tagline: string;
  /** What the buyer actually gets — used on /promote and the pricing section. */
  perks: string[];
  /** Which Dodo product to charge. */
  envKeys: string[];
};

export const PLACEMENTS: Record<Placement, PlacementSpec> = {
  featured: {
    key: "featured",
    name: "Featured Launch",
    dollars: 9,
    slots: 3,
    tagline: "Pinned to the top of the graveyard for 30 days.",
    perks: [
      "Pinned above every listing on Browse",
      "A “Featured” badge on your listing",
      "Dofollow backlink to your site",
      "An embeddable “Featured on Saasgrave” badge",
    ],
    envKeys: ["DODO_PRODUCT_ID_FEATURED_9", "DODO_PRODUCT_ID_FEATURED"],
  },
  sidebar: {
    key: "sidebar",
    name: "Sidebar Slot",
    dollars: 19,
    slots: 6,
    tagline: "Your product in the rail beside every listing.",
    perks: [
      "Your logo, headline and link in the side rail",
      "Shown on Browse and every startup page",
      "Dofollow backlink to your site",
      "30 days · only 6 slots exist",
    ],
    envKeys: ["DODO_PRODUCT_ID_ADS_19", "DODO_PRODUCT_ID_ADS"],
  },
  sponsored: {
    key: "sponsored",
    name: "Sponsored Row",
    dollars: 29,
    slots: 2,
    tagline: "A highlighted row inside the list itself — impossible to scroll past.",
    perks: [
      "A highlighted row inside the startup list",
      "Sits at position #2, above almost everything",
      "Dofollow backlink to your site",
      "30 days · only 2 rows exist",
    ],
    envKeys: ["DODO_PRODUCT_ID_ADS_29", "DODO_PRODUCT_ID_SPONSORED"],
  },
  newsletter: {
    key: "newsletter",
    name: "Newsletter Mention",
    dollars: 49,
    slots: 4,
    tagline: "A dedicated mention in The Weekly Obituary, straight to inboxes.",
    perks: [
      "A dedicated block in the weekly email",
      "Goes to every subscriber, not just site visitors",
      "Dofollow backlink to your site",
      "Includes a sidebar slot for the same week",
    ],
    envKeys: ["DODO_PRODUCT_ID_ADS_49", "DODO_PRODUCT_ID_NEWSLETTER"],
  },
};

/** Display order — cheapest first, the way the pricing section reads. */
export const PLACEMENT_ORDER: Placement[] = ["featured", "sidebar", "sponsored", "newsletter"];

export function isPlacement(v: unknown): v is Placement {
  return typeof v === "string" && v in PLACEMENTS;
}

export function placementSpec(p: Placement): PlacementSpec {
  return PLACEMENTS[p];
}

export function placementCents(p: Placement): number {
  return PLACEMENTS[p].dollars * 100;
}

/**
 * Which Dodo product to charge for a placement. Create one fixed-price product
 * per price point and set the matching env var; the first one set wins.
 */
export function placementProductId(p: Placement): string | undefined {
  for (const key of PLACEMENTS[p].envKeys) {
    const v = process.env[key]?.trim();
    if (v) return v;
  }
  return undefined;
}
