# Pantry Pal

Pantry Pal is a recipe site with 250 easy recipes made only from common food pantry ingredients. No recipe needs an oven. Visitors can filter by course, meal, cuisine, diet, tools, time, and difficulty. They can also type the ingredients they have to see what they can make, scale any recipe from 1 to 6 servings, and swap ingredients.

It is a static Next.js site with no backend, database, or environment variables, and deploys to Vercel as is.

## Getting started

Requires Node 20 or later.

```bash
npm install
```

```bash
npm run dev
```

The site runs at http://localhost:3000.

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Development server |
| `npm run build` | Validates content, runs unit tests, then builds. Vercel runs this. |
| `npm start` | Serves the production build |
| `npm test` | Unit tests (Vitest) |
| `npm run test:e2e` | Browser tests (Playwright, Chromium). Builds and starts the site on port 3100. Run `npx playwright install chromium` once first. |
| `npm run validate` | Checks every recipe against the content rules |
| `npm run lint` | ESLint |

## How it is organized

```
src/
  data/
    pantry.ts          every allowed ingredient, with aliases, groups, and diet flags
    schema.ts          recipe schema (Zod) and the allowed courses, cuisines, tools, units
    substitutions.ts   default ingredient swaps
    recipes/*.ts       the recipes, one file per course
  lib/
    catalog.ts         parses recipes and derives diet labels, total time, and "uses extras"
    scale.ts           serving-size scaling and friendly fractions (1 1/2 cups, 3 tbsp -> 1/4 cup)
    substitute.ts      resolves and applies swaps
    match.ts           ingredient autocomplete and "what can I make" matching
    filter.ts          all browse filters and their URL encoding
    diet.ts            diet labels computed from ingredients
    validate.ts        content rules used by the build and tests
  components/          UI, including the hand-drawn SVG doodles
  app/                 pages: home, recipes, recipe detail, pantry, favorites, about
docs/recipe-guide.md   how to write a recipe
```

### Ingredients

`src/data/pantry.ts` is the only source of ingredients. Each one has a tier:

- `pantry`: items food pantries commonly stock.
- `free`: water and ice, always assumed on hand.
- `extra`: basic seasonings such as cumin or soy sauce. The "Pantry basics only" filter hides recipes that require one.

Specific items can have a parent ("black beans" under "canned beans"), so searching for the general item finds recipes using the specific one.

### Diet labels

Diet labels (vegan, vegetarian, dairy-free, egg-free, gluten-free) are computed from each recipe's required ingredients, so they cannot drift from the ingredient list. They update when a visitor swaps an ingredient. Gluten-free is only shown when no ingredient might contain gluten. Broth, sausage, cereal, and cream soups count as "might".

### Content rules

The build fails if any recipe:

- uses an ingredient that is not in the pantry,
- mentions an oven, baking, broiling, or preheating,
- puts an amount such as "2 tbsp" inside a step (it would not scale),
- lists tools that do not match its steps,
- duplicates another recipe's slug or title,

or if the per-course counts do not add up to 250. See [docs/recipe-guide.md](docs/recipe-guide.md) before adding or editing recipes.

### Favorites and theme

Favorites and the light or dark theme choice are stored in the visitor's browser (`localStorage`). They do not sync across devices. If storage is blocked, the site still works and favorites last for the visit.

## Deploying to Vercel

1. Push the repository to GitHub.
2. In Vercel, choose Add New Project and import the repository. The Next.js preset needs no changes.
3. Optional: set `NEXT_PUBLIC_SITE_URL` to the production URL (for example `https://pantrypal.example`) so the sitemap and social previews use it. Without it, they use `https://pantry-pal.vercel.app`.

Every push builds a preview deployment, and the build fails if content validation or unit tests fail.
