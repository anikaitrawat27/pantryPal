import type { MetadataRoute } from "next";
import { localePath } from "@/i18n/config";
import { RECIPES } from "@/lib/catalog";

const BASE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://pantry-pal.vercel.app";

/** Every page in both languages, each listing its other-language version. */
export default function sitemap(): MetadataRoute.Sitemap {
  const paths = ["/", "/recipes", "/pantry", "/plan", "/about", ...RECIPES.map((r) => `/recipes/${r.slug}`)];
  return paths.flatMap((p) =>
    (["en", "es"] as const).map((lang) => ({
      url: `${BASE}${localePath(lang, p)}`,
      alternates: { languages: { en: `${BASE}${localePath("en", p)}`, es: `${BASE}${localePath("es", p)}` } },
    })),
  );
}
