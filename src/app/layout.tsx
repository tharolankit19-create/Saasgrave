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
    default: "Saasgrave — The resting place for dead SaaS",
    template: "%s · Saasgrave",
  },
  description:
    "A marketplace for failed and zero-revenue software startups. List what you built, study what others learned, and buy a product worth reviving.",
  openGraph: {
    title: "Saasgrave",
    description: "The resting place for dead SaaS.",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${fraunces.variable}`}>
      <body className="min-h-screen bg-canvas font-sans antialiased">
        <Navbar />
        <main>{children}</main>
        <Toaster
          theme="light"
          position="bottom-right"
          toastOptions={{
            style: {
              background: "#ffffff",
              border: "1px solid #e4e1d7",
              color: "#1c1b17",
            },
          }}
        />
        <Analytics />
      </body>
    </html>
  );
}
