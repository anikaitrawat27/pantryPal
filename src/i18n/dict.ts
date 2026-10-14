import type { Lang } from "./config";
import { en, type Dict } from "./strings/en";
import { es } from "./strings/es";

export type { Dict };

const DICTS: Record<Lang, Dict> = { en, es };

/** All interface strings for a language. The strings themselves live in ./strings. */
export function getDict(lang: Lang): Dict {
  return DICTS[lang];
}
