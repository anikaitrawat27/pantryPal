# Writing Pantry Pal recipes

Every recipe lives in a TypeScript file under `src/data/recipes/`, one file per course (mains are split across `mains-a.ts` and `mains-b.ts`). Each file exports one array built with `defineRecipes([...])`. `src/data/recipes/index.ts` combines them.

Check a file while you work:

```bash
npx tsx scripts/validate-content.ts --file src/data/recipes/drinks.ts
```

Check the whole catalog, including the per-course counts:

```bash
npm run validate
```

## The rules

1. Use only ingredient ids from the list below. Do not add new ingredients to `src/data/pantry.ts` without discussing it first.
2. Equipment is limited to `no-cook`, `microwave`, `stovetop`, `blender`, `toaster`, and `air-fryer`. Never use an oven or broiler, and do not write "bake", "preheat", "broil", "oven", or "baking sheet" anywhere in the recipe. "Baking powder" and "baking soda" are fine.
3. The `equipment` list must match the steps. If a step says skillet, pan, pot, boil, simmer, or fry, list `stovetop`. If a step says microwave, list `microwave`. "Blend" needs `blender`, "toaster" needs `toaster`, and "air fry" needs `air-fryer`. Do not list a tool that no step uses. Use `no-cook` alone or not at all.
4. Steps never contain amounts such as "2 tbsp" or "1 cup", because servings can be scaled from 1 to 6. Write "add the milk" or "add half the cheese". Times and heat levels ("cook for 5 minutes over medium heat") are fine.
5. Prefer air fryer or toaster only as a second option. A recipe whose only equipment is `air-fryer` or `toaster` should be rare. For example, "Cook in a covered skillet over low heat for 12 minutes, or air fry at 350°F for 8 minutes" lists both `stovetop` and `air-fryer`.
6. Extras (cinnamon, chili powder, cumin, paprika, Italian seasoning, soy sauce, vinegar, lemon juice, hot sauce, vanilla) are fine, but mark them `{ optional: true }` whenever the dish still works without them. A dish where the extra is essential (soy sauce in a stir-fry sauce) may keep it required.
7. `serves` is the base serving count, from 1 to 6. Quantities must be correct for that count.
8. Keep recipes easy. Difficulty is 1 for assemble-and-eat or one-pan, 2 for a few steps or a dough, and 3 for multi-part dishes. Most recipes should be 1 or 2.
9. Diet labels (vegan, vegetarian, dairy-free, egg-free, gluten-free) are computed from the ingredients. Do not add them by hand. Chicken broth counts as meat, honey is not vegan, and mayo contains egg.
10. Titles and slugs must be unique across the whole catalog. The slug is the kebab-case title.

## Writing style

- `blurb`: one or two sentences, under 220 characters. Say what the dish is and when you'd make it. Be friendly and concrete. Do not use hype words ("amazing", "delicious", "perfect"), emoji, or exclamation marks.
- Steps: short imperative sentences, one action each, in cooking order. Name the heat level and a visual cue ("until the edges set", "until golden").
- `tips`: optional. Use for a serving idea, a storage note, or a variation.
- Food safety: no raw eggs or raw flour in no-cook dishes. Ground meat and chicken are cooked through ("until no pink remains"). Microwaved eggs are covered and cooked until set.

## Ingredient tuples

```ts
["eggs", 2]                                  // 2 eggs (counted)
["milk", 0.5, "cup"]                         // 1/2 cup milk
["salt", "to taste"]
["cheese", 0.25, "cup", { optional: true }]
["onion", 1, { note: "diced" }]
["ice", 1, "handful", { fixed: true }]       // does not scale with servings
["butter", 2, "tbsp", { noSubs: true }]      // turns off swaps
["rice", 1, "cup", { subs: [{ id: "noodles", note: "Cook separately." }] }]
```

Units: `tsp`, `tbsp`, `cup`, `oz`, `lb`, `can`, `slice`, `clove`, `link`, `stick`, `packet`, `pinch`, `dash`, `splash`, `handful`, `leaf`. Leave the unit off for counted items (eggs, tortillas, potatoes, bananas). Use `"slice"` for bread. Count sausage and hot dogs with no unit. A standard can (about 15 oz) is `1, "can"`.

## Ingredient ids

- Fruits and vegetables: `apple`, `pear`, `orange`, `banana`, `berries`, `strawberries`, `blueberries`, `raspberries`, `frozen-fruit`, `carrot`, `onion`, `lettuce`, `tomato`, `potato`, `bell-pepper`, `garlic`, `cabbage`, `greens` (leafy greens such as spinach or kale)
- Dairy and eggs: `milk`, `eggs`, `butter`, `cheese`, `cheddar`, `parmesan`, `mozzarella`, `cream-cheese`, `yogurt`
- Proteins and beans: `chicken` (chicken breast), `ground-beef`, `ground-turkey`, `sausage`, `hot-dogs`, `canned-meat`, `canned-chicken`, `canned-tuna`, `canned-turkey`, `lentils`, `canned-beans`, `black-beans`, `kidney-beans`, `pinto-beans`, `chickpeas`, `peanut-butter`
- Grains, bread, and pasta: `pasta`, `noodles` (ramen or egg noodles), `rice`, `oats`, `cereal`, `tortillas`, `bread`, `biscuit-dough` (canned crescent or biscuit dough), `chips` (tortilla or potato chips)
- Canned goods: `canned-vegetables`, `canned-corn`, `canned-peas`, `canned-green-beans`, `canned-carrots`, `canned-mixed-veg`, `canned-spinach`, `diced-tomatoes`, `tomato-puree`, `pasta-sauce`, `soup` (any cream soup), `cream-of-mushroom`, `cream-of-chicken`, `chicken-broth`
- Baking: `flour`, `sugar`, `baking-powder`, `baking-soda`
- Condiments and staples: `jelly`, `mayo`, `honey`, `oil`, `salt`, `pepper` (black pepper), `garlic-ginger-paste`
- Extras: `cinnamon`, `chili-powder`, `cumin`, `paprika`, `italian-seasoning`, `soy-sauce`, `vinegar`, `lemon-juice`, `hot-sauce`, `vanilla`
- Always on hand: `water`, `ice`

There is no fresh mushroom, lemon, lime, cucumber, zucchini, sweet potato, celery, herbs, crackers, sour cream, feta, nuts, chocolate, cocoa, brown sugar, or coconut. Swap them for what is on the list (yogurt for sour cream, chips or toast for crackers, potato for sweet potato).

## Example

```ts
import { defineRecipes } from "../schema";

export const DRINKS = defineRecipes([
  {
    slug: "orange-refresher",
    title: "Orange Refresher",
    blurb: "A tangy, lightly sweet orange drink for a hot afternoon. Mash a fresh orange, stir, and pour over ice.",
    course: "drink",
    meal: ["snack"],
    cuisine: "american",
    equipment: ["no-cook"],
    difficulty: 1,
    prep: 5,
    cook: 0,
    serves: 1,
    ingredients: [
      ["orange", 1, { note: "large, peeled" }],
      ["water", 1, "cup"],
      ["sugar", 1, "tbsp"],
      ["ice", 1, "handful", { fixed: true }],
    ],
    steps: [
      "Break the orange into segments and mash them in a bowl with a fork until juicy.",
      "Stir in the water and sugar until the sugar dissolves.",
      "Pour over ice and serve.",
    ],
    tips: ["Use a blender instead of a fork for a smoother drink."],
  },
]);
```
