import type { RecipeInput } from "../schema";
import { APPETIZERS } from "./appetizers";
import { BREAKFAST } from "./breakfast";
import { DESSERTS } from "./desserts";
import { DRINKS } from "./drinks";
import { MAINS_A } from "./mains-a";
import { MAINS_B } from "./mains-b";
import { SALADS } from "./salads";
import { SIDES } from "./sides";
import { SOUPS } from "./soups";

/** Every recipe, unparsed. Use `RECIPES` from `@/lib/catalog` for validated data. */
export const RAW_RECIPES: readonly RecipeInput[] = [
  ...BREAKFAST,
  ...MAINS_A,
  ...MAINS_B,
  ...SOUPS,
  ...SALADS,
  ...APPETIZERS,
  ...SIDES,
  ...DRINKS,
  ...DESSERTS,
];
