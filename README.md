# Pantry Pal

Pantry Pal is a recipe site with 250 easy recipes made only from common food pantry ingredients. No recipe needs an oven. The whole site is available in English and Spanish.

What visitors can do:

- Filter by course, meal, cuisine, diet, tools, time, difficulty, and estimated cost, and sort by cost, time, or protein.
- Type the ingredients they have to see what they can make, or save their pantry on the device so every recipe shows what is missing.
- Scale any recipe from 1 to 6 servings and swap ingredients. Diet labels, calories, and cost update with each swap.
- Plan a week of meals by dragging recipes onto a calendar, then get one shopping list with amounts added together, grouped by aisle, priced, and minus what is already in the pantry.
- Cook in a full-screen, one-step-at-a-time mode with timers read from the steps and a screen wake lock.

It is a static Next.js site with no backend or database. Everything a visitor saves (pantry, plan, favorites, theme) stays in their browser.

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
| `npm run test:e2e` | Browser tests (Playwright, Chromium). Builds into `.next-e2e` and serves on port 3100, so it can run while `npm run dev` is running. Run `npx playwright install chromium` once first. |
| `npm run validate` | Checks every recipe and every Spanish translation against the content rules |
| `npm run lint` | ESLint |

## API

The site has a public JSON API. It needs no key, and the same requests work against `localhost:3000` in development.

| Endpoint | Purpose |
|---|---|
| `GET /api/recipes` | Search and filter, with cursor pagination |
| `GET /api/recipes/{slug}?servings=&swap=from:to&lang=` | One recipe, scaled, with swaps applied |
| `POST /api/shopping-list` | Combine planned meals into one priced list |
| `GET /api/openapi.json` | OpenAPI 3.1 description |

```bash
curl "http://localhost:3000/api/recipes/creamy-tomato-soup?servings=6&swap=chicken-broth:water&lang=es"
```

- **Validation:** every parameter and body field is validated with Zod. Unknown parameters are rejected, too.
- **Errors:** errors share one shape, `{ "error": { "code", "message", "fields"? } }`, where `fields` maps each invalid input path to a message.
- **Caching:** GET responses are cacheable at the CDN for an hour, because the catalog only changes on deploy.
- **Docs:** `/developers` renders the OpenAPI description with live examples.
- **Code layout:** the route handlers in `src/app/api/` stay thin. The logic lives in `src/lib/api/recipes.ts` and reuses the same filtering, scaling, and shopping code the pages use.
- **Used by the site:** the shopping list page calls `POST /api/shopping-list`.

## How it is organized

```
src/
  data/
    pantry.ts          every allowed ingredient, with aliases, groups, and diet flags
    facts.ts           grams per unit, nutrition per 100 g, and a typical package price for each ingredient
    schema.ts          recipe schema (Zod) and the allowed courses, cuisines, tools, units
    substitutions.ts   default ingredient swaps
    recipes/*.ts       the recipes, one file per course
  i18n/
    config.ts          languages and URL helpers (English at /, Spanish at /es)
    dict.ts            every interface string in both languages
    ingredients.ts     localized ingredient names, units, package labels, and swap notes
    recipes.ts         picks a recipe's text in the page language
    es/                Spanish ingredient glossary and recipe translations, one file per course
  lib/
    api/               request schemas, endpoint logic, error handling, OpenAPI description, typed client
    catalog.ts         parses recipes and derives diet labels, nutrition, cost, and "uses extras"
    scale.ts           serving-size scaling and friendly fractions (1 1/2 cups, 3 tbsp -> 1/4 cup)
    nutrition.ts       weights, nutrition, and cost estimates
    substitute.ts      resolves and applies swaps
    match.ts           ingredient autocomplete and "what can I make" matching
    filter.ts          browse filters, sorting, and their URL encoding
    plan.ts            weekly meal plan model
    shopping.ts        combines planned meals into one shopping list
    timers.ts          finds cooking times in steps, in English and Spanish
    my-pantry.ts       the visitor's saved pantry
    storage.ts         localStorage-backed state shared across components
    validate.ts        English content rules; validate-es.ts checks translations
  views/               page bodies shared by the English and Spanish routes
  components/          UI, including the hand-drawn SVG doodles
  app/                 routes; app/es mirrors every English page
docs/recipe-guide.md   how to write and translate a recipe
```

### Ingredients

`src/data/pantry.ts` is the only source of ingredients. Each one has a tier:

- `pantry`: items food pantries commonly stock.
- `free`: water and ice, always assumed on hand.
- `extra`: basic seasonings such as cumin or soy sauce. The "Pantry basics only" filter hides recipes that require one.

Specific items can have a parent ("black beans" under "canned beans"), so searching for the general item finds recipes using the specific one.

### Diet labels

Diet labels (vegan, vegetarian, dairy-free, egg-free, gluten-free) are computed from each recipe's required ingredients, so they cannot drift from the ingredient list. They update when a visitor swaps an ingredient. Gluten-free is only shown when no ingredient might contain gluten. Broth, sausage, cereal, and cream soups count as "might".

### Nutrition and cost estimates

`src/data/facts.ts` gives each ingredient a weight for every unit recipes use, nutrition per 100 g, and a typical U.S. package price. From those, the site estimates calories, protein, fiber, and cost per serving, and the shopping list rounds each item up to whole packages. Cooked rice converts to dry weight, and only a fifth of shallow-frying oil counts toward nutrition. These are planning estimates, and the site labels them that way. A test fails if any recipe line cannot be weighed, so new ingredients or units need facts.

### Spanish

English pages live at `/` and Spanish pages at `/es`, both generated at build time. Interface strings are in `src/i18n/dict.ts`; the Spanish dictionary must have the same shape as the English one, so a missing string is a type error. Recipe text is in `src/i18n/es/recipes/`, keyed by slug, and the build fails if any recipe is missing a translation, has a different number of steps or tips, or breaks the no-oven and no-amounts rules. Ingredient lines, units, and swap notes are generated in Spanish from the same data, so amounts always match the English.

### Content rules

The build fails if any recipe:

- uses an ingredient that is not in the pantry,
- mentions an oven, baking, broiling, or preheating,
- puts an amount such as "2 tbsp" inside a step (it would not scale),
- lists tools that do not match its steps,
- duplicates another recipe's slug or title,

or if the per-course counts do not add up to 250. See [docs/recipe-guide.md](docs/recipe-guide.md) before adding or editing recipes.

### Saved data

Favorites, the saved pantry, the meal plan, shopping-list checkmarks, and the theme are stored in the visitor's browser (`localStorage`). They do not sync across devices. If storage is blocked, the site still works and changes last for the visit.

## Deploying to Vercel

1. Push the repository to GitHub.
2. In Vercel, choose Add New Project and import the repository. The Next.js preset needs no changes.
3. Optional: set `NEXT_PUBLIC_SITE_URL` to the production URL (for example `https://pantrypal.example`) so the sitemap and social previews use it. Without it, they use `https://pantry-pal.vercel.app`.

Every push builds a preview deployment, and the build fails if content validation or unit tests fail.
