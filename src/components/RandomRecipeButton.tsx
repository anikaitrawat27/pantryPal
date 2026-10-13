"use client";

import { useRouter } from "next/navigation";
import { useDict, useLang } from "@/i18n/client";
import { localePath } from "@/i18n/config";
import ui from "./ui.module.css";

export function RandomRecipeButton({ slugs }: { slugs: string[] }) {
  const router = useRouter();
  const lang = useLang();
  const t = useDict().home;
  return (
    <button
      type="button"
      className={ui.button}
      onClick={() => router.push(localePath(lang, `/recipes/${slugs[Math.floor(Math.random() * slugs.length)]}`))}
    >
      {t.surprise}
    </button>
  );
}
