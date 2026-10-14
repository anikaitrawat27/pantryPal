"use client";

import Link from "next/link";
import type { Course } from "@/data/schema";
import { useDict } from "@/i18n/client";
import type { RecipeListItem } from "@/lib/api/search";
import { formatUsd } from "@/lib/nutrition";
import { CourseDoodle } from "../Doodle";
import ui from "../ui.module.css";
import styles from "./chat.module.css";

/** A compact link to a catalog recipe that a chat tool returned. */
export function RecipeChip({ recipe }: { recipe: RecipeListItem }) {
  const d = useDict();
  const missing = recipe.pantryMatch?.missing.length ?? 0;
  return (
    <Link href={recipe.url} className={`${ui.card} ${styles.recipe}`}>
      <CourseDoodle course={recipe.course as Course} size={36} />
      <span>
        <strong>{recipe.title}</strong>
        <small>
          {d.units.minutes(recipe.totalMinutes)} · {formatUsd(recipe.costPerServingUsd)}
          {missing > 0 && ` · ${d.card.missingN(missing)}`}
        </small>
      </span>
    </Link>
  );
}
