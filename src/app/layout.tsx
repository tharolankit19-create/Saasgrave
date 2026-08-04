import type { Metadata } from "next";
import { Inter, Fraunces } from "next/font/google";
import Script from "next/script";
import { Toaster } from "sonner";
import { Navbar } from "@/components/navbar";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans", display: "swap" });
const fraunces = Fraunces({ subsets: ["latin"], variable: "--font-serif", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
  title: {
    default: "Saasgrave — Your dead startup is still worth money",
    template: "%s · Saasgrave",
  },
  description:
    "List a dead or zero-revenue startup in 3 minutes. Free to list, $9 to sell, 0% commission.",
  keywords: [
    "failed startups",
    "buy dead startups",
    "sell a startup",
    "startup marketplace",
    "acquire SaaS",
    "startup post-mortem",
    "zero revenue startup",
  ],
  openGraph: {
    title: "Your dead startup is still worth money.",
    description:
      "The marketplace for dead & zero-revenue startups. Free to list, $9 to sell, 0% commission.",
    type: "website",
    siteName: "Saasgrave",
  },
  twitter: {
    card: "summary_large_image",
    title: "Your dead startup is still worth money.",
    description:
      "List a dead or zero-revenue startup in 3 minutes. Free to list, $9 to sell, 0% commission.",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${fraunces.variable}`}>
      <body className="min-h-screen bg-ink-950 font-sans antialiased">
        <Navbar />
        <main>{children}</main>
        <Toaster
          theme="dark"
          position="bottom-right"
          toastOptions={{
            style: {
              background: "#141418",
              border: "1px solid rgba(245,244,241,0.08)",
              color: "#f5f4f1",
            },
          }}
        />
        <Analytics />
      </body>
    </html>
  );
}
