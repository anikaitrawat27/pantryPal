import type { Metadata } from "next";
import Link from "next/link";
import { GROUP_LABELS, INGREDIENTS, type IngredientGroup } from "@/data/pantry";
import { RECIPES } from "@/lib/catalog";
import { related } from "@/lib/match";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "The pantry",
  description: "Every ingredient Pantry Pal recipes use, grouped by shelf, with links to the recipes that use each one.",
};

const GROUP_ORDER: IngredientGroup[] = ["produce", "dairy-eggs", "protein", "grains", "canned", "baking", "condiments", "extras"];

export default function PantryPage() {
  const usage = new Map(
    INGREDIENTS.map((ing) => [ing.id, RECIPES.filter((r) => r.ingredients.some((ri) => related(ri.id, ing.id))).length]),
  );
  return (
    <div className="container">
      <h1>
        <span className="highlight">The pantry</span>
      </h1>
      <p className={styles.intro}>
        These are the only ingredients Pantry Pal recipes use, plus water and ice. Tap one to see every recipe that uses it. Extras are basic
        seasonings that not every pantry stocks; turn on &quot;Pantry basics only&quot; on the recipes page to hide them.
      </p>
      <div className={styles.shelves}>
        {GROUP_ORDER.map((g) => (
          <section key={g} className={`${styles.shelf} ${g === "extras" ? styles.extras : ""}`} aria-labelledby={`shelf-${g}`}>
            <h2 id={`shelf-${g}`}>{GROUP_LABELS[g]}</h2>
            <ul>
              {INGREDIENTS.filter((i) => i.group === g).map((i) => (
                <li key={i.id}>
                  <Link href={`/recipes?have=${i.id}`}>{i.name}</Link>
                  <span className={styles.count}>{usage.get(i.id)}</span>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}
