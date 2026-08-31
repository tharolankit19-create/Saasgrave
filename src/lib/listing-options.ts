// The fixed vocabularies a listing is built from. Shared so the form, the AI
// autofill and anything else always agree on the allowed values — a category
// the model invents would silently fail the form's <select>.

export const CATEGORIES = [
  "SaaS",
  "Mobile app",
  "Chrome extension",
  "Marketplace",
  "AI tool",
  "DevTool",
  "Consumer",
  "Other",
];

export const REASONS = [
  "No market need",
  "Ran out of cash",
  "Competition",
  "Wrong team",
  "Bad timing",
  "Lost focus",
  "Other",
];

export const CHANNELS = [
  "SEO",
  "Twitter/X",
  "Cold email",
  "Product Hunt",
  "Reddit",
  "Ads",
  "Content",
  "Word of mouth",
];
