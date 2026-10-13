import type { RecipeEs } from "../../recipe-es";
import { APPETIZERS_ES } from "./appetizers";
import { BREAKFAST_ES } from "./breakfast";
import { DESSERTS_ES } from "./desserts";
import { DRINKS_ES } from "./drinks";
import { MAINS_A_ES } from "./mains-a";
import { MAINS_B_ES } from "./mains-b";
import { SALADS_ES } from "./salads";
import { SIDES_ES } from "./sides";
import { SOUPS_ES } from "./soups";

/** Spanish recipe text keyed by slug. */
export const RECIPES_ES: Readonly<Record<string, RecipeEs>> = {
  ...BREAKFAST_ES,
  ...MAINS_A_ES,
  ...MAINS_B_ES,
  ...SOUPS_ES,
  ...SALADS_ES,
  ...APPETIZERS_ES,
  ...SIDES_ES,
  ...DRINKS_ES,
  ...DESSERTS_ES,
};
