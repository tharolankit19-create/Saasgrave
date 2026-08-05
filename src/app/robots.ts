import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const base = process.env.NEXT_PUBLIC_SITE_URL || "https://saasgrave.com";
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // Keep private/app routes out of the index; everything public is open,
        // including to AI crawlers so assistants can read and cite the guides.
        disallow: ["/dashboard", "/onboarding", "/profile/edit", "/checkout", "/api/"],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
    host: base,
  };
}
