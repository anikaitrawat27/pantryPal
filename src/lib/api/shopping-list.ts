import { z } from "zod";
import { packLabel } from "@/i18n/ingredients";
import { getRecipe, RECIPES, toSummary } from "@/lib/catalog";
import { buildShoppingList, shoppingListText } from "@/lib/shopping";
import { ApiError, fieldsFromZod } from "./http";
import { ingredientId, langParam } from "./params";

/** POST /api/shopping-list: combine planned meals into one priced list. */

const MAX_MEALS = 60;

export const shoppingListBodySchema = z
  .object({
    meals: z
      .array(
        z
          .object({
            slug: z.string().refine(
              (s) => Boolean(getRecipe(s)),
              (s) => ({ message: `Unknown recipe "${s}"` }),
            ),
            servings: z.number().int().min(1).max(6),
          })
          .strict(),
      )
      .max(MAX_MEALS, `At most ${MAX_MEALS} meals`),
    pantry: z
      .object({ have: z.array(ingredientId).default([]), low: z.array(ingredientId).default([]) })
      .strict()
      .default({ have: [], low: [] }),
    checked: z.array(ingredientId).default([]),
    lang: langParam,
  })
  .strict();

export type ShoppingListBody = z.infer<typeof shoppingListBodySchema>;

export function parseShoppingListBody(raw: unknown): ShoppingListBody {
  const result = shoppingListBodySchema.safeParse(raw);
  if (!result.success) throw ApiError.invalid("Invalid request body.", fieldsFromZod(result.error));
  return result.data;
}

export interface ShoppingListResponse {
  items: {
    id: string;
    group: string;
    line: string;
    status: "buy" | "low" | "have";
    packages: number;
    packageLabel: string | null;
    costUsd: number;
    recipes: string[];
    checked: boolean;
  }[];
  totalUsd: number;
  /** Text version of the items still to buy, for copying. */
  text: string;
}

export function shoppingList(body: ShoppingListBody): ShoppingListResponse {
  const { lang } = body;
  const bySlug = new Map(RECIPES.map((r) => [r.slug, toSummary(r, lang)]));
  const list = buildShoppingList(body.meals, bySlug, body.pantry, lang);
  const items = list.items.map((i) => ({
    id: i.id,
    group: i.group,
    line: i.line,
    status: i.status,
    packages: i.packages,
    packageLabel: i.packLabel ? packLabel(i.packLabel, lang) : null,
    costUsd: i.cost,
    recipes: i.recipes,
    checked: body.checked.includes(i.id),
  }));
  return { items, totalUsd: list.total, text: shoppingListText(list, body.checked, (l) => packLabel(l, lang)) };
}
