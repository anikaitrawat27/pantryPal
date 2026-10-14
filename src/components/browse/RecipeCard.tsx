import Link from "next/link";
import { localePath, type Lang } from "@/i18n/config";
import { getDict } from "@/i18n/dict";
import { ingredientName } from "@/i18n/ingredients";
import type { RecipeSummary } from "@/lib/catalog";
import type { PantryMatch } from "@/lib/match";
import { formatUsd } from "@/lib/nutrition";
import { CourseDoodle, ToolIcon } from "../Doodle";
import { PantryStatus } from "./PantryStatus";
import styles from "./RecipeCard.module.css";
import ui from "../ui.module.css";

/** Only the most useful diet labels go on cards; the full list is on the recipe page. */
const CARD_DIETS = ["vegan", "vegetarian"] as const;

interface Props {
  recipe: RecipeSummary;
  lang: Lang;
  match?: PantryMatch;
  index?: number;
}

export function RecipeCard({ recipe, lang, match, index = 0 }: Props) {
  const t = getDict(lang);
  const diet = CARD_DIETS.find((d) => recipe.diets.includes(d));
  const tools = recipe.equipment.filter((e) => e !== "no-cook");
  return (
    <article
      className={`${ui.card} ${styles.card}`}
      style={{ "--tilt": `${[-1, 0.8, -0.5, 1.1][index % 4]}deg` } as React.CSSProperties}
    >
      <Link href={localePath(lang, `/recipes/${recipe.slug}`)} className={styles.link}>
        <div className={styles.top}>
          <CourseDoodle course={recipe.course} size={56} className={styles.doodle} />
          <span className={styles.course}>{t.courses[recipe.course]}</span>
        </div>
        <h3 className={styles.title}>{recipe.title}</h3>
        <p className={styles.blurb}>{recipe.blurb}</p>
      </Link>

      {match && (match.missing.length > 0 || match.swaps.length > 0) && (
        <div className={styles.match}>
          {match.missing.length > 0 && (
            <p>
              <strong>{t.card.missing}:</strong> {match.missing.map((id) => ingredientName(id, lang)).join(", ")}
            </p>
          )}
          {match.swaps.map((s) => (
            <p key={s.from}>
              <strong>{t.card.swap}:</strong> {t.card.swapFor(ingredientName(s.to, lang), ingredientName(s.from, lang))}
            </p>
          ))}
        </div>
      )}
      {match && match.missing.length === 0 && match.swaps.length === 0 && (
        <p className={styles.ready}>{t.card.ready}</p>
      )}
      {!match && <PantryStatus ingredients={recipe.ingredients} />}

      <div className={styles.meta}>
        <span>{t.units.minutes(recipe.totalMin)}</span>
        <span aria-hidden="true">·</span>
        <span>{t.difficulty[recipe.difficulty]}</span>
        <span aria-hidden="true">·</span>
        <span title={t.card.costTitle}>{formatUsd(recipe.cost)}</span>
        <span className={styles.tools}>
          {(tools.length === 0 ? (["no-cook"] as const) : tools).map((tool) => (
            <span key={tool} title={t.equipment[tool]}>
              <ToolIcon tool={tool} />
              <span className="sr-only">{t.equipment[tool]}</span>
            </span>
          ))}
        </span>
      </div>
      {(diet || recipe.usesExtras) && (
        <div className={styles.badges}>
          {diet && <span className={`${ui.badge} ${ui.badgeSage}`}>{t.diets[diet]}</span>}
          {recipe.usesExtras && <span className={`${ui.badge} ${ui.badgeMustard}`}>{t.card.usesExtras}</span>}
        </div>
      )}
    </article>
  );
}
