import Link from "next/link";
import { getIngredient } from "@/data/pantry";
import type { RecipeSummary } from "@/lib/catalog";
import { DIET_LABELS } from "@/lib/diet";
import { COURSE_LABELS, DIFFICULTY_LABELS, EQUIPMENT_LABELS, formatMinutes } from "@/lib/labels";
import type { PantryMatch } from "@/lib/match";
import { CourseDoodle, ToolIcon } from "./Doodle";
import styles from "./RecipeCard.module.css";
import ui from "./ui.module.css";

/** Only the most useful diet labels go on cards; the full list is on the recipe page. */
const CARD_DIETS = ["vegan", "vegetarian"] as const;

export function RecipeCard({ recipe, match, index = 0 }: { recipe: RecipeSummary; match?: PantryMatch; index?: number }) {
  const diet = CARD_DIETS.find((d) => recipe.diets.includes(d));
  const tools = recipe.equipment.filter((e) => e !== "no-cook");
  return (
    <article className={`${ui.card} ${styles.card}`} style={{ "--tilt": `${[-1, 0.8, -0.5, 1.1][index % 4]}deg` } as React.CSSProperties}>
      <Link href={`/recipes/${recipe.slug}`} className={styles.link}>
        <div className={styles.top}>
          <CourseDoodle course={recipe.course} size={56} className={styles.doodle} />
          <span className={styles.course}>{COURSE_LABELS[recipe.course]}</span>
        </div>
        <h3 className={styles.title}>{recipe.title}</h3>
        <p className={styles.blurb}>{recipe.blurb}</p>
      </Link>

      {match && (match.missing.length > 0 || match.swaps.length > 0) && (
        <div className={styles.match}>
          {match.missing.length > 0 && (
            <p>
              <strong>Missing:</strong> {match.missing.map((id) => getIngredient(id).name).join(", ")}
            </p>
          )}
          {match.swaps.map((s) => (
            <p key={s.from}>
              <strong>Swap:</strong> {getIngredient(s.to).name} for {getIngredient(s.from).name}
            </p>
          ))}
        </div>
      )}
      {match && match.missing.length === 0 && match.swaps.length === 0 && <p className={styles.ready}>You have everything</p>}

      <div className={styles.meta}>
        <span>{formatMinutes(recipe.totalMin)}</span>
        <span aria-hidden="true">·</span>
        <span>{DIFFICULTY_LABELS[recipe.difficulty]}</span>
        <span className={styles.tools}>
          {tools.length === 0 ? (
            <span title={EQUIPMENT_LABELS["no-cook"]}>
              <ToolIcon tool="no-cook" />
              <span className="sr-only">{EQUIPMENT_LABELS["no-cook"]}</span>
            </span>
          ) : (
            tools.map((t) => (
              <span key={t} title={EQUIPMENT_LABELS[t]}>
                <ToolIcon tool={t} />
                <span className="sr-only">{EQUIPMENT_LABELS[t]}</span>
              </span>
            ))
          )}
        </span>
      </div>
      {(diet || recipe.usesExtras) && (
        <div className={styles.badges}>
          {diet && <span className={`${ui.badge} ${ui.badgeSage}`}>{DIET_LABELS[diet]}</span>}
          {recipe.usesExtras && <span className={`${ui.badge} ${ui.badgeMustard}`}>Uses extras</span>}
        </div>
      )}
    </article>
  );
}
