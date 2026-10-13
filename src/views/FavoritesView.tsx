import { FavoritesList } from "@/components/FavoritesList";
import type { Lang } from "@/i18n/config";
import { getDict } from "@/i18n/dict";
import { RECIPES, toSummary } from "@/lib/catalog";

export function FavoritesView({ lang }: { lang: Lang }) {
  return (
    <div className="container" lang={lang}>
      <h1>
        <span className="highlight">{getDict(lang).favorites.heading}</span>
      </h1>
      <FavoritesList recipes={RECIPES.map((r) => toSummary(r, lang))} />
    </div>
  );
}
