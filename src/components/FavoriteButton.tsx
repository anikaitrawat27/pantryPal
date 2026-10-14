"use client";

import { useDict } from "@/i18n/client";
import { useFavorites } from "@/client/favorites";
import { HeartIcon } from "./Doodle";
import ui from "./ui.module.css";

export function FavoriteButton({ slug, title }: { slug: string; title: string }) {
  const t = useDict().recipe;
  const { isFavorite, toggle } = useFavorites();
  const on = isFavorite(slug);
  return (
    <button
      type="button"
      className={ui.button}
      aria-pressed={on}
      onClick={() => toggle(slug)}
      aria-label={on ? t.unsaveLabel(title) : t.saveLabel(title)}
    >
      <HeartIcon filled={on} />
      {on ? t.saved : t.save}
    </button>
  );
}
