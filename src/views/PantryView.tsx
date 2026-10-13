import { PantryShelves } from "@/components/PantryShelves";
import { INGREDIENTS } from "@/data/pantry";
import type { Lang } from "@/i18n/config";
import { getDict } from "@/i18n/dict";
import { RECIPES } from "@/lib/catalog";
import { related } from "@/lib/match";
import styles from "./PantryView.module.css";

export function PantryView({ lang }: { lang: Lang }) {
  const t = getDict(lang).pantry;
  const usage = Object.fromEntries(
    INGREDIENTS.map((ing) => [
      ing.id,
      RECIPES.filter((r) => r.ingredients.some((ri) => related(ri.id, ing.id))).length,
    ]),
  );
  return (
    <div className="container" lang={lang}>
      <h1>
        <span className="highlight">{t.heading}</span>
      </h1>
      <p className={styles.intro}>{t.intro}</p>
      <PantryShelves usage={usage} />
    </div>
  );
}
