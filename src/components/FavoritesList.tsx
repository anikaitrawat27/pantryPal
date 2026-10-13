"use client";

import Link from "next/link";
import type { RecipeSummary } from "@/lib/catalog";
import { useFavorites } from "@/lib/favorites";
import { HeartIcon } from "./Doodle";
import { RecipeCard } from "./RecipeCard";
import styles from "./RecipeBrowser.module.css";

export function FavoritesList({ recipes }: { recipes: RecipeSummary[] }) {
  const { favorites } = useFavorites();
  const saved = favorites.map((slug) => recipes.find((r) => r.slug === slug)).filter((r): r is RecipeSummary => Boolean(r));

  if (saved.length === 0) {
    return (
      <div className={styles.empty}>
        <p className="hand">No favorites yet.</p>
        <p>
          Tap the <HeartIcon filled={false} size={20} /> Save button on any recipe to keep it here. Favorites are stored on this device only.
        </p>
        <p>
          <Link href="/recipes">Browse recipes</Link>
        </p>
      </div>
    );
  }
  return (
    <>
      <p>Saved on this device. {saved.length} {saved.length === 1 ? "recipe" : "recipes"}.</p>
      <div className={styles.grid}>
        {saved.map((r, i) => (
          <RecipeCard key={r.slug} recipe={r} index={i} />
        ))}
      </div>
    </>
  );
}
