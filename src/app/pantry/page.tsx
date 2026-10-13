import type { Metadata } from "next";
import { PantryShelves } from "@/components/PantryShelves";
import { INGREDIENTS } from "@/data/pantry";
import { RECIPES } from "@/lib/catalog";
import { related } from "@/lib/match";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "My pantry",
  description: "Every ingredient Pantry Pal recipes use. Mark what you have to see what you can make.",
};

export default function PantryPage() {
  const usage = Object.fromEntries(
    INGREDIENTS.map((ing) => [ing.id, RECIPES.filter((r) => r.ingredients.some((ri) => related(ri.id, ing.id))).length]),
  );
  return (
    <div className="container">
      <h1>
        <span className="highlight">My pantry</span>
      </h1>
      <p className={styles.intro}>
        These are the only ingredients Pantry Pal recipes use, plus water and ice. Extras are basic seasonings that not every pantry stocks.
        The number next to each item is how many recipes use it.
      </p>
      <PantryShelves usage={usage} />
    </div>
  );
}
