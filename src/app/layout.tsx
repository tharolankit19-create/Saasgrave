import type { Metadata } from "next";
import { Manrope, Fraunces } from "next/font/google";
import Script from "next/script";
import { Toaster } from "sonner";
import { Navbar } from "@/components/navbar";
import { CommunityBar } from "@/components/community-bar";
import { AnnouncementPopup } from "@/components/announcement-popup";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

// Editorial pairing: a warm high-contrast serif for display, a clean modern
// grotesque for everything else. Distinct enough to not read as a template.
const manrope = Manrope({ subsets: ["latin"], variable: "--font-sans", display: "swap" });
const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-serif",
  display: "swap",
  axes: ["opsz", "SOFT", "WONK"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://saasgrave.org"),
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
    <html lang="en" className={`${manrope.variable} ${fraunces.variable}`}>
      <body className="min-h-screen bg-ink-950 font-sans antialiased">
        {/* Google Tag Manager (noscript) — must sit right after <body> opens */}
        <noscript>
          {/* eslint-disable-next-line @next/next/no-sync-scripts */}
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-PPZMR289"
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
          />
        </noscript>
        <div className="sticky top-0 z-40">
          <CommunityBar />
          <Navbar />
        </div>
        <main>{children}</main>
        <AnnouncementPopup />
        <Toaster
          theme="light"
          position="bottom-right"
          toastOptions={{
            style: {
              background: "#ffffff",
              border: "1px solid rgba(23,20,15,0.10)",
              color: "#17140f",
              boxShadow: "0 10px 40px -12px rgba(23,20,15,0.18)",
            },
          }}
        />
        <Analytics />
        {/* Google Tag Manager — loads gtm.js and initialises the dataLayer */}
        <Script
          id="gtm"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','GTM-PPZMR289');`,
          }}
        />
        {/* DataFast analytics — public website id, safe in client HTML. */}
        <Script
          defer
          data-website-id="dfid_PMJJEOurjVUlHkZgBfT2z"
          data-domain="saasgrave.org"
          src="https://datafa.st/js/script.js"
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}
