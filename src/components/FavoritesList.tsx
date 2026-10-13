"use client";

import Link from "next/link";
import { useDict, useLang } from "@/i18n/client";
import { localePath } from "@/i18n/config";
import type { RecipeSummary } from "@/lib/catalog";
import { useFavorites } from "@/lib/favorites";
import { HeartIcon } from "./Doodle";
import { RecipeCard } from "./RecipeCard";
import styles from "./RecipeBrowser.module.css";

export function FavoritesList({ recipes }: { recipes: RecipeSummary[] }) {
  const { favorites } = useFavorites();
  const lang = useLang();
  const t = useDict().favorites;
  const saved = favorites.map((slug) => recipes.find((r) => r.slug === slug)).filter((r): r is RecipeSummary => Boolean(r));

  if (saved.length === 0) {
    return (
      <div className={styles.empty}>
        <p className="hand">{t.emptyTitle}</p>
        <p>
          {t.emptyBodyStart} <HeartIcon filled={false} size={20} /> {t.emptyBodyEnd}
        </p>
        <p>
          <Link href={localePath(lang, "/recipes")}>{t.browse}</Link>
        </p>
      </div>
    );
  }
  return (
    <>
      <p>{t.count(saved.length)}</p>
      <div className={styles.grid}>
        {saved.map((r, i) => (
          <RecipeCard key={r.slug} recipe={r} lang={lang} index={i} />
        ))}
      </div>
    </>
  );
}
