import { Sparkles, Megaphone, Rows3, Mail, Globe, Layers } from "lucide-react";
import type { ProductKey } from "@/lib/ad-pricing";

const ICONS: Record<ProductKey, typeof Sparkles> = {
  featured: Sparkles,
  sidebar: Megaphone,
  sponsored: Rows3,
  newsletter: Mail,
  directory: Globe,
  bundle: Layers,
};

/** One icon per purchasable product, shared by /pricing, /promote and the landing. */
export function ProductIcon({ product, size = 18 }: { product: ProductKey; size?: number }) {
  const Icon = ICONS[product];
  return <Icon size={size} />;
}
