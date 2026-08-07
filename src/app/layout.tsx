import type { Metadata } from "next";
import { Bricolage_Grotesque, JetBrains_Mono } from "next/font/google";
import Script from "next/script";
import { Toaster } from "sonner";
import { Navbar } from "@/components/navbar";
import { CommunityBar } from "@/components/community-bar";
import { AnnouncementPopup } from "@/components/announcement-popup";
import { PromotePopup } from "@/components/promote-popup";
import { NewsletterBar } from "@/components/newsletter-bar";
import { NewsletterFomoPopup } from "@/components/newsletter-fomo-popup";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

// A distinctive, characterful pairing — Bricolage Grotesque (optically-sized,
// clearly "designed", not a generic sans) across the whole product, with
// JetBrains Mono for the small labels and figures.
const grotesk = Bricolage_Grotesque({ subsets: ["latin"], variable: "--font-sans", display: "swap" });
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono", display: "swap" });

const SITE = process.env.NEXT_PUBLIC_SITE_URL || "https://saasgrave.org";

export const metadata: Metadata = {
  metadataBase: new URL(SITE),
  title: {
    default: "Saasgrave — Your dead startup is still worth money",
    template: "%s · Saasgrave",
  },
  description:
    "List a dead or zero-revenue startup in 3 minutes. Free to list & sell — just 3% on a sale.",
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
      "The marketplace for dead & zero-revenue startups. Free to list & sell — just 3% on a sale.",
    type: "website",
    siteName: "Saasgrave",
  },
  twitter: {
    card: "summary_large_image",
    title: "Your dead startup is still worth money.",
    description:
      "List a dead or zero-revenue startup in 3 minutes. Free to list & sell — just 3% on a sale.",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${grotesk.variable} ${mono.variable}`}>
      <body className="min-h-screen bg-ink-950 font-sans antialiased">
        {/* Structured data — lets Google show the brand name + logo, and
            understand the site's search action. Logo points at the generated icon. */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@graph": [
                {
                  "@type": "Organization",
                  "@id": `${SITE}/#org`,
                  name: "Saasgrave",
                  url: SITE,
                  logo: `${SITE}/icon`,
                  sameAs: ["https://x.com/SaasGrave"],
                  description:
                    "The marketplace for dead and zero-revenue startups. List a failed startup in 3 minutes — free to list & sell — just 3% on a sale.",
                },
                {
                  "@type": "WebSite",
                  "@id": `${SITE}/#website`,
                  url: SITE,
                  name: "Saasgrave",
                  publisher: { "@id": `${SITE}/#org` },
                  potentialAction: {
                    "@type": "SearchAction",
                    target: { "@type": "EntryPoint", urlTemplate: `${SITE}/browse?q={search_term_string}` },
                    "query-input": "required name=search_term_string",
                  },
                },
              ],
            }),
          }}
        />
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
        <PromotePopup />
        <NewsletterFomoPopup />
        <NewsletterBar />
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
        {/* Google tag (gtag.js) — GA4 measurement G-L15159J1T9 */}
        <Script src="https://www.googletagmanager.com/gtag/js?id=G-L15159J1T9" strategy="afterInteractive" />
        <Script
          id="ga4"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','G-L15159J1T9');`,
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
