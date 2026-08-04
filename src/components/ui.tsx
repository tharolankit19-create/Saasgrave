import Link from "next/link";
import { cn } from "@/lib/utils";

// A tiny, purpose-built primitive set. Not a full design system — just the
// pieces this app repeats: buttons, badges, cards, section labels.

type ButtonProps = {
  variant?: "primary" | "ghost" | "outline";
  size?: "sm" | "md" | "lg";
  className?: string;
} & React.ButtonHTMLAttributes<HTMLButtonElement>;

const base =
  "inline-flex items-center justify-center gap-2 rounded-full font-medium transition-all duration-200 active:scale-[0.98] disabled:opacity-40 disabled:pointer-events-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500/40 focus-visible:ring-offset-2 focus-visible:ring-offset-ink-950";

const variants = {
  primary: "bg-bone-100 text-ink-950 shadow-card hover:bg-[#2b261d] hover:shadow-lift",
  ghost: "text-bone-300 hover:text-bone-100 hover:bg-ink-800",
  outline: "border border-black/12 bg-ink-900 text-bone-100 hover:border-black/25 hover:bg-ink-850 hover:shadow-card",
};

const sizes = { sm: "h-8 px-3.5 text-sm", md: "h-10 px-5 text-sm", lg: "h-12 px-7 text-[15px]" };

export function Button({ variant = "primary", size = "md", className, ...props }: ButtonProps) {
  return <button className={cn(base, variants[variant], sizes[size], className)} {...props} />;
}

export function LinkButton({
  href,
  variant = "primary",
  size = "md",
  className,
  children,
}: {
  href: string;
  variant?: keyof typeof variants;
  size?: keyof typeof sizes;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <Link href={href} className={cn(base, variants[variant], sizes[size], className)}>
      {children}
    </Link>
  );
}

export function Badge({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border border-black/10 bg-ink-800 px-2.5 py-1 text-xs text-bone-300",
        className
      )}
    >
      {children}
    </span>
  );
}

export function Card({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-black/8 bg-ink-900 shadow-card",
        className
      )}
    >
      {children}
    </div>
  );
}

export function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-3 text-xs font-medium uppercase tracking-[0.22em] text-ember-500">{children}</p>
  );
}
