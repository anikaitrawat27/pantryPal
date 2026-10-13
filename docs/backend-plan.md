# Backend plan: API, accounts, and chatbot

Three phases, each shippable on its own. Everything deploys with the existing Next.js app on Vercel; there is no separate server.

Decisions:

- Password reset uses one-time recovery codes shown at signup. There is no email service.
- The chatbot uses Claude Sonnet 5.5 (`claude-sonnet-5-5`) and is available to logged-in users only.
- The database is Postgres on Neon, attached through the Vercel Marketplace.

## Phase 1: public JSON API

Route handlers under `src/app/api/`, reusing the existing logic in `src/lib/`.

| Endpoint | Purpose |
|---|---|
| `GET /api/recipes` | Search and filter. Query: `q, course, meal, cuisine, diet, tools, maxTime, maxLevel, maxCost, noExtras, have, mode, sort, lang, limit, cursor` |
| `GET /api/recipes/[slug]` | One recipe. Query: `servings` (1-6), `lang`, `swap=<from>:<to>` (repeatable). Returns scaled lines, nutrition, cost, and diets after swaps |
| `POST /api/shopping-list` | Body: `{ meals: [{ slug, servings }], pantry?: { have, low }, lang? }`. Returns items, packages, and total |
| `GET /api/openapi.json` | OpenAPI 3.1 description of the above |

- Every input is parsed with Zod. Failures return `400` with `{ error: { code: "invalid_request", message, fields } }`, and unknown slugs return `404`.
- GET responses send `Cache-Control: public, s-maxage=3600, stale-while-revalidate=86400`. The catalog only changes on deploy.
- Cursor pagination uses an opaque base64 offset with a maximum `limit` of 50.
- The shopping list page calls `POST /api/shopping-list` instead of computing the list locally.
- Tests call the route handlers directly with `Request` objects (valid input, every invalid field, 404, pagination edges, Spanish output). An E2E test calls the live endpoints.

## Phase 2: accounts and sync

- Database access uses Drizzle ORM and migrations in `drizzle/`. Tables:
  - `users`: id, username (unique, case-insensitive), password_hash, created_at
  - `sessions`: id (SHA-256 of the token), user_id, expires_at
  - `recovery_codes`: user_id, code_hash, used_at
  - `pantry_items`: user_id, ingredient_id, low
  - `plan_entries`: id, user_id, day, meal, slug, servings
  - `favorites`: user_id, slug
  - `shopping_checks`: user_id, ingredient_id
  - `saved_recipes`: id, user_id, recipe JSON, created_at (used in Phase 3)
  - `chat_usage`: user_id, day, messages, input_tokens, output_tokens
- Passwords are hashed with Argon2id (`@node-rs/argon2`). Usernames are 3-24 characters (letters, digits, `_`, `-`); passwords are at least 10 characters.
- Sessions use a 32-byte random token in an `HttpOnly; Secure; SameSite=Lax` cookie, and only its SHA-256 hash is stored. They last 30 days and renew when fewer than 15 days remain. Logging out deletes the row.
- Recovery codes: signup shows 8 codes once and stores only their Argon2id hashes. A reset needs the username, an unused code, and a new password. It marks the code used and ends every session for that user.
- Protection:
  - Every state-changing request must come from the site's own origin (checked with the `Origin` header).
  - Login and reset attempts are rate-limited per IP and per username, counted in Postgres.
  - Login gives the same error and takes the same time whether or not the username exists.
- Sync: guests keep using `localStorage`. On first login, local data merges into the account by union, with the server winning on conflicts. After that, the stores read and write through `/api/me/*`, with optimistic updates.
- Endpoints:
  - `POST /api/auth/signup`, `/login`, `/logout`, `/reset`
  - `GET /api/me`
  - `GET|PUT /api/me/pantry`, `/plan`, `/favorites`, `/checks`
- Tests: auth and sync logic run against a Postgres test database (PGlite in-process, so CI needs no server). E2E covers signup, recovery-code reset, and sync across two browser contexts.

## Phase 3: chatbot (`/chat`)

- `POST /api/chat` streams the reply as server-sent events. It uses the Anthropic TypeScript SDK with `claude-sonnet-5-5`, adaptive thinking, effort `low` for chat turns, and the tool runner for the tool loop.
- Tools, each with a Zod schema and `strict: true`:
  - `search_recipes(filters)` reuses `filterRecipes`.
  - `get_recipe(slug, servings, swaps)`
  - `what_can_i_make(have?, maxMissing)` defaults to the user's saved pantry.
  - `generate_recipe(request)` calls a nested structured-output request for a recipe in the `recipeSchema` shape. The result runs through `validateRecipes` and the facts check, and failures go back to the model to fix, up to 2 retries. Invalid recipes are never shown.
- The browser renders tool activity as status chips, recipe results as real recipe cards, and generated recipes in the recipe layout with servings, swaps, and a "Save to my recipes" button.
- Cost controls:
  - Prompt caching on the system prompt and tool definitions.
  - 30 messages per user per day, a 4,000-token output cap per turn, and the last 20 turns sent as history.
  - Token usage recorded in `chat_usage`.
- `stop_reason: "refusal"` produces a friendly message; the server-side fallback is enabled with `fallbacks: "default"`.
- Requires `ANTHROPIC_API_KEY` in Vercel environment variables.
- Tests: tool functions are unit-tested without the model. The generate-and-validate retry loop is tested with a mocked client that returns an invalid recipe first. One opt-in live test runs only when an API key is set.

## Setup steps for the owner

1. Vercel dashboard: Storage, then add Neon Postgres to the project. This sets `DATABASE_URL`.
2. Vercel dashboard: Settings, then Environment Variables, then add `ANTHROPIC_API_KEY` (Phase 3).
3. For local development, run `vercel env pull .env.local` and then `npm run db:migrate`.
