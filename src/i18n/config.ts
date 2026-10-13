export const LANGS = ["en", "es"] as const;
export type Lang = (typeof LANGS)[number];

export const LANG_NAMES: Record<Lang, string> = { en: "English", es: "Español" };

/** English lives at the root; Spanish under /es. */
export function localePath(lang: Lang, path: string): string {
  if (lang === "en") return path;
  return path === "/" ? "/es" : `/es${path}`;
}

/** The language of a pathname such as "/es/recipes". */
export function langFromPath(pathname: string): Lang {
  return pathname === "/es" || pathname.startsWith("/es/") ? "es" : "en";
}

/** The same page in the other language. */
export function switchLangPath(pathname: string, to: Lang): string {
  const base = langFromPath(pathname) === "es" ? pathname.slice(3) || "/" : pathname;
  return localePath(to, base);
}
