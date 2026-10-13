import type { Metadata } from "next";
import { FavoritesList } from "@/components/FavoritesList";
import { RECIPES, toSummary } from "@/lib/catalog";

export const metadata: Metadata = {
  title: "Favorites",
  description: "Recipes you have saved on this device.",
};

export default function FavoritesPage() {
  return (
    <div className="container">
      <h1>
        <span className="highlight">Your favorites</span>
      </h1>
      <FavoritesList recipes={RECIPES.map(toSummary)} />
    </div>
  );
}
