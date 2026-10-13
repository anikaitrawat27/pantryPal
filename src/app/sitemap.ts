import type { MetadataRoute } from "next";
import { RECIPES } from "@/lib/catalog";

const BASE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://pantry-pal.vercel.app";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    ...["", "/recipes", "/pantry", "/about"].map((p) => ({ url: `${BASE}${p}` })),
    ...RECIPES.map((r) => ({ url: `${BASE}/recipes/${r.slug}` })),
  ];
}
