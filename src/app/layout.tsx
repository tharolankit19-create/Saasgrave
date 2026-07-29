import type { Metadata } from "next";
import { Inter, Fraunces } from "next/font/google";
import { Toaster } from "sonner";
import { Navbar } from "@/components/navbar";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans", display: "swap" });
const fraunces = Fraunces({ subsets: ["latin"], variable: "--font-serif", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
  title: {
    default: "Graveyard — Where dead startups find new life",
    template: "%s · Graveyard",
  },
  description:
    "A quiet marketplace for failed and zero-revenue startups. List what you built, browse what others left behind, and give a dead product a second life.",
  openGraph: {
    title: "Graveyard",
    description: "Where dead startups find new life.",
    type: "website",
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
      </body>
    </html>
  );
}
