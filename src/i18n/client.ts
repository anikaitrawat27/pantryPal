"use client";

import { usePathname } from "next/navigation";
import { langFromPath, type Lang } from "./config";
import { getDict, type Dict } from "./dict";

/** The current page's language, from its URL. */
export function useLang(): Lang {
  return langFromPath(usePathname() ?? "/");
}

export function useDict(): Dict {
  return getDict(useLang());
}
