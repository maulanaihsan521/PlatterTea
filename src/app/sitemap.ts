import type { MetadataRoute } from "next";
import { db } from "@/lib/db";
import { getOrLoad } from "@/lib/simple-cache";

// Sitemap dinamis untuk mesin pencari. Sejak routing path-based, setiap view
// punya URL sendiri (syarat sitelinks Google) + URL detail produk /produk/{slug}.
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://plattertea.vercel.app";

// Regenerasi sitemap.xml maksimal sekali per jam (hemat query ke Supabase)
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticEntries: MetadataRoute.Sitemap = [
    {
      url: `${SITE_URL}/`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${SITE_URL}/menu`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/promo`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/about`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${SITE_URL}/contact`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${SITE_URL}/faq`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
  ];

  // URL detail produk — gagal DB pun sitemap tetap terbit (fallback statis saja)
  try {
    const products = await getOrLoad("sitemap:products", async () =>
      db.product.findMany({
        where: { status: "PUBLISHED" },
        select: { slug: true, updatedAt: true },
        orderBy: { sortOrder: "asc" },
      })
    );
    const productEntries: MetadataRoute.Sitemap = products.map((p) => ({
      url: `${SITE_URL}/produk/${p.slug}`,
      lastModified: p.updatedAt,
      changeFrequency: "weekly",
      priority: 0.7,
    }));
    return [...staticEntries, ...productEntries];
  } catch {
    return staticEntries;
  }
}
