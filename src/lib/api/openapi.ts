import { COURSES, CUISINES, EQUIPMENT, MEALS } from "@/data/schema";
import { LANGS } from "@/i18n/config";
import { DIETS } from "@/lib/diet";
import { SORTS } from "@/lib/filter";

const csv = (values: readonly string[], description: string) => ({
  type: "string",
  description: `${description} Comma-separated; any of: ${values.join(", ")}.`,
});

const query = (name: string, schema: object, description?: string) => ({
  name,
  in: "query",
  required: false,
  schema,
  ...(description ? { description } : {}),
});

const lang = query(
  "lang",
  { type: "string", enum: LANGS, default: "en" },
  "Language of titles, steps, and ingredient lines.",
);

const errorResponse = (description: string) => ({
  description,
  content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } },
});

const nutrition = {
  type: "object",
  properties: { calories: { type: "integer" }, proteinGrams: { type: "integer" }, fiberGrams: { type: "integer" } },
};

/** OpenAPI 3.1 description of the public API. Kept in sync with the Zod schemas by tests/unit/api.test.ts. */
export const OPENAPI = {
  openapi: "3.1.0",
  info: {
    title: "Pantry Pal API",
    version: "1.0.0",
    description:
      "Search 250 food-pantry recipes, fetch one scaled to 1-6 servings with ingredient swaps, and combine a meal plan into a priced shopping list. All amounts, nutrition, and prices are estimates.",
  },
  paths: {
    "/api/recipes": {
      get: {
        summary: "Search and filter recipes",
        parameters: [
          query(
            "q",
            { type: "string", maxLength: 100 },
            "Words that must all appear in the recipe title.",
          ),
          query("course", csv(COURSES, "Courses.")),
          query("meal", csv(MEALS, "Meals; a recipe matches if it fits any.")),
          query("cuisine", csv(CUISINES, "Cuisines.")),
          query("diet", csv(DIETS, "Diets; a recipe must satisfy all.")),
          query("tools", csv(EQUIPMENT, "Tools the cook has; a recipe matches if it needs nothing else.")),
          query("maxTime", { type: "integer", minimum: 1, maximum: 600 }, "Maximum total minutes."),
          query("maxLevel", { type: "integer", minimum: 1, maximum: 3 }, "Maximum difficulty."),
          query(
            "maxCost",
            { type: "number", exclusiveMinimum: 0, maximum: 100 },
            "Maximum estimated U.S. dollars per serving.",
          ),
          query("noExtras", { type: "boolean" }, "Hide recipes that require an extra seasoning."),
          query("have", { type: "string" }, "Comma-separated ingredient ids."),
          query(
            "mode",
            { type: "string", enum: ["includes", "only"], default: "includes" },
            "`includes`: recipes using all of `have`. `only`: recipes makeable from `have`, ranked by fewest missing.",
          ),
          query("sort", { type: "string", enum: SORTS, default: "az" }),
          lang,
          query("limit", { type: "integer", minimum: 1, maximum: 50, default: 20 }),
          query("cursor", { type: "string" }, "`nextCursor` from the previous page."),
        ],
        responses: {
          "200": {
            description: "A page of matching recipes.",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["data", "total", "nextCursor"],
                  properties: {
                    data: { type: "array", items: { $ref: "#/components/schemas/RecipeListItem" } },
                    total: { type: "integer" },
                    nextCursor: { type: ["string", "null"] },
                  },
                },
              },
            },
          },
          "400": errorResponse("Unknown parameter or invalid value."),
        },
      },
    },
    "/api/recipes/{slug}": {
      get: {
        summary: "Get one recipe, scaled and with swaps applied",
        parameters: [
          { name: "slug", in: "path", required: true, schema: { type: "string" } },
          query("servings", { type: "integer", minimum: 1, maximum: 6 }, "Defaults to the recipe's own serving count."),
          lang,
          {
            name: "swap",
            in: "query",
            required: false,
            description:
              'Repeatable. "from:to" ingredient ids, e.g. swap=butter:oil. Must be one of the ingredient\'s swapOptions.',
            schema: { type: "array", items: { type: "string", pattern: "^[a-z0-9-]+:[a-z0-9-]+$" } },
            style: "form",
            explode: true,
          },
        ],
        responses: {
          "200": {
            description: "The recipe.",
            content: { "application/json": { schema: { $ref: "#/components/schemas/RecipeDetail" } } },
          },
          "400": errorResponse("Invalid servings or swap."),
          "404": errorResponse("No recipe with that slug."),
        },
      },
    },
    "/api/shopping-list": {
      post: {
        summary: "Combine planned meals into one shopping list",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                additionalProperties: false,
                required: ["meals"],
                properties: {
                  meals: {
                    type: "array",
                    maxItems: 60,
                    items: {
                      type: "object",
                      additionalProperties: false,
                      required: ["slug", "servings"],
                      properties: { slug: { type: "string" }, servings: { type: "integer", minimum: 1, maximum: 6 } },
                    },
                  },
                  pantry: {
                    type: "object",
                    additionalProperties: false,
                    properties: {
                      have: {
                        type: "array",
                        items: { type: "string" },
                        description: "Ingredient ids already at home.",
                      },
                      low: {
                        type: "array",
                        items: { type: "string" },
                        description: "Ingredient ids at home but running low; these are bought again.",
                      },
                    },
                  },
                  checked: {
                    type: "array",
                    items: { type: "string" },
                    description: "Ingredient ids already ticked off.",
                  },
                  lang: { type: "string", enum: LANGS, default: "en" },
                },
              },
            },
          },
        },
        responses: {
          "200": {
            description: "The combined list. Amounts are summed across meals and rounded up to whole packages.",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    items: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          id: { type: "string" },
                          group: { type: "string" },
                          line: { type: "string", examples: ["2 cans + 1 cup canned corn"] },
                          status: { type: "string", enum: ["buy", "low", "have"] },
                          packages: { type: "integer" },
                          packageLabel: { type: ["string", "null"] },
                          costUsd: { type: "number" },
                          recipes: { type: "array", items: { type: "string" } },
                          checked: { type: "boolean" },
                        },
                      },
                    },
                    totalUsd: { type: "number" },
                    text: { type: "string" },
                  },
                },
              },
            },
          },
          "400": errorResponse("Invalid body: unknown recipe or ingredient, servings out of range, or malformed JSON."),
        },
      },
    },
  },
  components: {
    schemas: {
      Error: {
        type: "object",
        required: ["error"],
        properties: {
          error: {
            type: "object",
            required: ["code", "message"],
            properties: {
              code: { type: "string", enum: ["invalid_request", "not_found", "internal_error"] },
              message: { type: "string" },
              fields: {
                type: "object",
                additionalProperties: { type: "string" },
                description: "Per-field problems, keyed by path.",
              },
            },
          },
        },
      },
      RecipeListItem: {
        type: "object",
        properties: {
          slug: { type: "string" },
          url: { type: "string" },
          title: { type: "string" },
          blurb: { type: "string" },
          course: { type: "string", enum: COURSES },
          meals: { type: "array", items: { type: "string", enum: MEALS } },
          cuisine: { type: "string", enum: CUISINES },
          equipment: { type: "array", items: { type: "string", enum: EQUIPMENT } },
          difficulty: { type: "integer", minimum: 1, maximum: 3 },
          totalMinutes: { type: "integer" },
          baseServings: { type: "integer" },
          diets: { type: "array", items: { type: "string", enum: DIETS } },
          usesExtras: { type: "boolean" },
          nutritionPerServing: nutrition,
          costPerServingUsd: { type: "number" },
          pantryMatch: {
            type: "object",
            description: "Only with mode=only.",
            properties: {
              missing: { type: "array", items: { type: "string" } },
              swaps: {
                type: "array",
                items: { type: "object", properties: { from: { type: "string" }, to: { type: "string" } } },
              },
            },
          },
        },
      },
      RecipeDetail: {
        type: "object",
        properties: {
          slug: { type: "string" },
          title: { type: "string" },
          servings: { type: "integer" },
          baseServings: { type: "integer" },
          prepMinutes: { type: "integer" },
          cookMinutes: { type: "integer" },
          ingredients: {
            type: "array",
            items: {
              type: "object",
              properties: {
                id: { type: "string" },
                name: { type: "string" },
                line: { type: "string", examples: ["1 1/2 cups milk"] },
                quantity: { type: ["number", "null"] },
                unit: { type: ["string", "null"] },
                note: { type: ["string", "null"] },
                optional: { type: "boolean" },
                extra: { type: "boolean" },
                swappedFrom: { type: ["string", "null"] },
                swapOptions: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      id: { type: "string" },
                      name: { type: "string" },
                      note: { type: ["string", "null"] },
                    },
                  },
                },
              },
            },
          },
          steps: { type: "array", items: { type: "string" } },
          tips: { type: "array", items: { type: "string" } },
          diets: { type: "array", items: { type: "string", enum: DIETS } },
          nutritionPerServing: nutrition,
          costPerServingUsd: { type: "number" },
          totalCostUsd: { type: "number" },
        },
      },
    },
  },
} as const;
