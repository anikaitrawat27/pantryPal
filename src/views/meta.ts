import type { Metadata } from "next";
import { localePath, type Lang } from "@/i18n/config";

/** Title, description, canonical URL, and links to the page in each language. */
export function pageMeta(lang: Lang, path: string, title: string, description: string): Metadata {
  return {
    // The home page title is the site name itself, so skip the "%s · Pantry Pal" template.
    title: path === "/" ? { absolute: title } : title,
    description,
    alternates: {
      canonical: localePath(lang, path),
      languages: { en: localePath("en", path), es: localePath("es", path) },
    },
    openGraph: { title: `${title} · Pantry Pal`, description, locale: lang === "es" ? "es_US" : "en_US" },
  };
}
