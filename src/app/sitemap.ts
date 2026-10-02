import type { MetadataRoute } from "next";

// Sitemap untuk mesin pencari. Website ini SPA hash-routing (single route "/"),
// jadi satu entri canonical sudah lengkap — hash view (#/menu, dsb.) bukan URL
// terpisah bagi Google.
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://plattertea.vercel.app";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: `${SITE_URL}/`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
  ];
}
