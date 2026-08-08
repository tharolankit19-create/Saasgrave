// ─── Promotion catalogue ────────────────────────────────────
// Every paid thing on the site, in one place. Prices are flat per product for a
// 30-day run, and every one carries a dofollow link back to the buyer's site.
// What's scarce isn't the price — it's the slot counts, which are hard caps.

/** Products backed by a row in `ad_slots` (the `placement` column). */
export type Placement = "sidebar" | "sponsored" | "newsletter";

/** Everything that can be bought. */
export type ProductKey = "featured" | Placement | "directory" | "bundle";

export type ProductSpec = {
  key: ProductKey;
  name: string;
  dollars: number;
  /** Hard cap on how many can run at once. `null` = unlimited (nothing to sell out). */
  slots: number | null;
  tagline: string;
  perks: string[];
  /** Dodo product env vars, tried in order. */
  envKeys: string[];
};

export const PRODUCTS: Record<ProductKey, ProductSpec> = {
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
  directory: {
    key: "directory",
    name: "Directory Blast",
    dollars: 99,
    slots: null,
    tagline: "We submit your product to 100+ startup directories by hand.",
    perks: [
      "Submitted to 100+ startup & SaaS directories",
      "Done manually — no spam, no bots",
      "A backlink report when it's finished",
      "Turnaround within 7 days",
    ],
    envKeys: ["DODO_PRODUCT_ID_DIRECTORY_99", "DODO_PRODUCT_ID_DIRECTORY"],
  },
  bundle: {
    key: "bundle",
    name: "The Everything Bundle",
    dollars: 149,
    slots: null,
    tagline: "Every placement we sell, plus the directory blast — at a real discount.",
    perks: [
      "Featured Launch — pinned to the top",
      "Sidebar Slot beside every listing",
      "Sponsored Row inside the list",
      "Newsletter Mention in The Weekly Obituary",
      "100+ directory submissions",
      "Dofollow backlinks from every one",
    ],
    envKeys: ["DODO_PRODUCT_ID_BUNDLE_149", "DODO_PRODUCT_ID_BUNDLE"],
  },
};

/** What the bundle grants, and therefore what it's compared against. */
export const BUNDLE_INCLUDES: ProductKey[] = [
  "featured",
  "sidebar",
  "sponsored",
  "newsletter",
  "directory",
];

/** Full price of the bundle's contents bought separately. */
export const BUNDLE_LIST_PRICE = BUNDLE_INCLUDES.reduce((sum, k) => sum + PRODUCTS[k].dollars, 0);
export const BUNDLE_SAVING = BUNDLE_LIST_PRICE - PRODUCTS.bundle.dollars;

/** Ad-slot placements, cheapest first. */
export const PLACEMENT_ORDER: Placement[] = ["sidebar", "sponsored", "newsletter"];

/** Everything purchasable, cheapest first — the order the pricing page reads. */
export const PRODUCT_ORDER: ProductKey[] = [
  "featured",
  "sidebar",
  "sponsored",
  "newsletter",
  "directory",
  "bundle",
];

const PLACEMENTS_SET = new Set<string>(PLACEMENT_ORDER);

export function isPlacement(v: unknown): v is Placement {
  return typeof v === "string" && PLACEMENTS_SET.has(v);
}

export function productSpec(key: ProductKey): ProductSpec {
  return PRODUCTS[key];
}

export function productCents(key: ProductKey): number {
  return PRODUCTS[key].dollars * 100;
}

/**
 * Which Dodo product to charge. Create one fixed-price product per price point
 * and set the matching env var; the first one set wins.
 */
export function productDodoId(key: ProductKey): string | undefined {
  for (const envKey of PRODUCTS[key].envKeys) {
    const v = process.env[envKey]?.trim();
    if (v) return v;
  }
  return undefined;
}

// ─── Back-compat aliases used by the ad-slot paths ──────────
export const PLACEMENTS = PRODUCTS;
export const placementCents = productCents;
export const placementProductId = productDodoId;
