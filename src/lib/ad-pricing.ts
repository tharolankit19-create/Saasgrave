// ─── Promotion catalogue ────────────────────────────────────
// Every paid thing on the site, in one place. Prices are flat, each product
// runs for its own fixed length, and every one carries a dofollow link back to
// the buyer's site. What's scarce isn't the price — it's the slot counts,
// which are hard caps.

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
  /** How long a purchase runs, in days. `null` = one-off, nothing expires. */
  days: number | null;
  /** Short human duration, e.g. "/ 1 week" — what the price is actually per. */
  unit: string;
  tagline: string;
  perks: string[];
  /**
   * The ONE Dodo product env var for this price. Deliberately a single name
   * with no fallback — a shared fallback is how every product ended up
   * charging the same amount.
   */
  envKey: string;
};

export const PRODUCTS: Record<ProductKey, ProductSpec> = {
  featured: {
    key: "featured",
    name: "Featured Launch",
    dollars: 9,
    slots: 3,
    days: 7,
    unit: "/ 1 week",
    tagline: "Pinned to the very top of the graveyard for a week.",
    perks: [
      "Pinned above every listing on Browse",
      "A “Featured” badge on your listing",
      "Dofollow backlink to your site",
      "No website badge required for this paid launch",
    ],
    envKey: "DODO_PRODUCT_ID_FEATURED_9",
  },
  sidebar: {
    key: "sidebar",
    name: "Sidebar Slot",
    dollars: 19,
    slots: 6,
    days: 30,
    unit: "/ 1 month",
    tagline: "Your product in the rail beside every listing, all month.",
    perks: [
      "Your logo, headline and link in the side rail",
      "Shown on Browse and every startup page",
      "Dofollow backlink to your site",
      "A full month · only 6 slots exist",
    ],
    envKey: "DODO_PRODUCT_ID_ADS_19",
  },
  sponsored: {
    key: "sponsored",
    name: "Sponsored Row",
    dollars: 29,
    slots: 2,
    days: 30,
    unit: "/ 1 month",
    tagline: "A highlighted row inside the list itself — impossible to scroll past.",
    perks: [
      "A highlighted row inside the startup list",
      "Sits at position #2, above almost everything",
      "Dofollow backlink to your site",
      "A full month · only 2 rows exist",
    ],
    envKey: "DODO_PRODUCT_ID_ADS_29",
  },
  newsletter: {
    key: "newsletter",
    name: "Newsletter Mention",
    dollars: 49,
    slots: 4,
    days: 30,
    unit: "/ 1 month",
    tagline: "A dedicated mention in The Weekly Obituary, straight to inboxes.",
    perks: [
      "A dedicated block in the weekly email",
      "Goes to every subscriber, not just site visitors",
      "Dofollow backlink to your site",
      "Includes a sidebar slot for the same week",
    ],
    envKey: "DODO_PRODUCT_ID_ADS_49",
  },
  directory: {
    key: "directory",
    name: "Directory Blast",
    dollars: 99,
    slots: null,
    days: null,
    unit: "one-off",
    tagline: "We submit your product to 100+ startup directories by hand.",
    perks: [
      "Submitted to 100+ startup & SaaS directories",
      "Done manually — no spam, no bots",
      "A backlink report when it's finished",
      "Turnaround within 7 days",
    ],
    envKey: "DODO_PRODUCT_ID_DIRECTORY_99",
  },
  bundle: {
    key: "bundle",
    name: "The Everything Bundle",
    dollars: 149,
    slots: null,
    days: 30,
    unit: "one payment",
    tagline: "Every placement we sell, plus the directory blast — at a real discount.",
    perks: [
      "Featured Launch — pinned to the top for a week",
      "Sidebar Slot beside every listing for a month",
      "Sponsored Row inside the list for a month",
      "Newsletter Mention in The Weekly Obituary",
      "100+ directory submissions",
      "Dofollow backlinks from every one",
    ],
    envKey: "DODO_PRODUCT_ID_BUNDLE_149",
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

/**
 * Placements that show on the site itself. The sidebar slot sits in the middle
 * — where the eye lands first on a three-up row — and carries the only
 * "Most popular" badge.
 */
export const ONSITE_ORDER: ProductKey[] = ["featured", "sidebar", "sponsored"];

/** Reach that goes beyond the site — shown together, below the on-site ones. */
export const REACH_ORDER: ProductKey[] = ["newsletter", "directory"];

/** The single product we steer people towards. */
export const MOST_POPULAR: ProductKey = "sidebar";

/** Everything purchasable — on-site placements first, led by the popular one. */
export const PRODUCT_ORDER: ProductKey[] = [...ONSITE_ORDER, ...REACH_ORDER, "bundle"];

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

/** How long a purchase runs, in days — `null` for one-off products. */
export function productDays(key: ProductKey): number | null {
  return PRODUCTS[key].days;
}

/** When a purchase made now would end, or `null` if it never expires. */
export function runEndsAt(key: ProductKey, from = new Date()): Date | null {
  const days = PRODUCTS[key].days;
  return days == null ? null : new Date(from.getTime() + days * 24 * 60 * 60 * 1000);
}

/**
 * Which Dodo product to charge. Create one fixed-price Dodo product per price
 * point and set that product's own env var. Returns undefined when it isn't
 * configured — callers must fail rather than substitute another product.
 */
export function productDodoId(key: ProductKey): string | undefined {
  return process.env[PRODUCTS[key].envKey]?.trim() || undefined;
}

/** The env var a product needs, for error messages that tell you what to fix. */
export function productEnvName(key: ProductKey): string {
  return PRODUCTS[key].envKey;
}

// ─── Back-compat aliases used by the ad-slot paths ──────────
export const PLACEMENTS = PRODUCTS;
export const placementCents = productCents;
export const placementProductId = productDodoId;
