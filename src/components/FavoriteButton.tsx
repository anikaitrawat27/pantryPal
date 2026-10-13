"use client";

import { useFavorites } from "@/lib/favorites";
import { HeartIcon } from "./Doodle";
import ui from "./ui.module.css";

export function FavoriteButton({ slug, title }: { slug: string; title: string }) {
  const { isFavorite, toggle } = useFavorites();
  const on = isFavorite(slug);
  return (
    <button type="button" className={ui.button} aria-pressed={on} onClick={() => toggle(slug)} aria-label={on ? `Remove ${title} from favorites` : `Save ${title} to favorites`}>
      <HeartIcon filled={on} />
      {on ? "Saved" : "Save"}
    </button>
  );
}
