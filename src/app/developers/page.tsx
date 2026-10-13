import type { Metadata } from "next";
import { OPENAPI } from "@/lib/api/openapi";
import { parseDetailQuery, parseSearchQuery, recipeDetail, searchRecipes, shoppingList } from "@/lib/api/recipes";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "API",
  description: "The Pantry Pal JSON API: recipe search, scaled recipes, and shopping lists.",
};

interface Param {
  name: string;
  in: string;
  required?: boolean;
  description?: string;
  schema: Record<string, unknown>;
}

function typeOf(schema: Record<string, unknown>): string {
  if (schema.enum) return (schema.enum as string[]).join(" | ");
  if (schema.type === "array") return "string (repeatable)";
  const range =
    schema.minimum !== undefined && schema.maximum !== undefined ? ` ${schema.minimum}-${schema.maximum}` : "";
  return `${schema.type}${range}`;
}

/** Shortens arrays in example responses so the page stays readable. */
function trim(value: unknown, depth = 0): unknown {
  if (Array.isArray(value)) {
    const max = depth === 0 ? 2 : 3;
    const head = value.slice(0, max).map((v) => trim(v, depth + 1));
    return value.length > max ? [...head, `… ${value.length - max} more`] : head;
  }
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, trim(v, depth + 1)]));
  }
  return value;
}

/** Example calls, run at build time against the real catalog. */
const EXAMPLES = [
  {
    method: "GET",
    path: "/api/recipes",
    call: "/api/recipes?course=soup&diet=vegan&sort=cost&limit=2",
    response: () => searchRecipes(parseSearchQuery(new URLSearchParams("course=soup&diet=vegan&sort=cost&limit=2"))),
  },
  {
    method: "GET",
    path: "/api/recipes/{slug}",
    call: "/api/recipes/creamy-tomato-soup?servings=6&swap=chicken-broth:water",
    response: () =>
      recipeDetail("creamy-tomato-soup", parseDetailQuery(new URLSearchParams("servings=6&swap=chicken-broth:water"))),
  },
  {
    method: "POST",
    path: "/api/shopping-list",
    call: "/api/shopping-list",
    body: {
      meals: [
        { slug: "biryani", servings: 4 },
        { slug: "chinese-fried-rice", servings: 3 },
      ],
      pantry: { have: ["rice"], low: [] },
    },
    response: () =>
      shoppingList({
        meals: [
          { slug: "biryani", servings: 4 },
          { slug: "chinese-fried-rice", servings: 3 },
        ],
        pantry: { have: ["rice"], low: [] },
        checked: [],
        lang: "en",
      }),
  },
] as const;

export default function DevelopersPage() {
  return (
    <div className={`container ${styles.page}`}>
      <h1>
        <span className="highlight">Pantry Pal API</span>
      </h1>
      <p>{OPENAPI.info.description}</p>
      <p>
        JSON over HTTPS, no key required. Errors always look like{" "}
        <code>{`{ "error": { "code", "message", "fields"? } }`}</code>, where <code>fields</code> names each invalid
        input. The machine-readable description is at <a href="/api/openapi.json">/api/openapi.json</a>.
      </p>

      {EXAMPLES.map((ex) => {
        const op = (
          OPENAPI.paths as Record<string, Record<string, { summary: string; parameters?: readonly Param[] }>>
        )[ex.path][ex.method.toLowerCase()];
        const params = (op.parameters ?? []).filter((p) => p.in === "query");
        const curl =
          ex.method === "GET"
            ? `curl "https://YOUR-SITE${ex.call}"`
            : `curl -X POST "https://YOUR-SITE${ex.call}" \\\n  -H "content-type: application/json" \\\n  -d '${JSON.stringify("body" in ex ? ex.body : {})}'`;
        return (
          <section key={ex.path} className={styles.endpoint} aria-labelledby={ex.path}>
            <h2 id={ex.path}>
              <span className={styles.method}>{ex.method}</span> <code>{ex.path}</code>
            </h2>
            <p>{op.summary}.</p>
            {params.length > 0 && (
              <table className={styles.params}>
                <thead>
                  <tr>
                    <th scope="col">Parameter</th>
                    <th scope="col">Type</th>
                    <th scope="col">Description</th>
                  </tr>
                </thead>
                <tbody>
                  {params.map((p) => (
                    <tr key={p.name}>
                      <td>
                        <code>{p.name}</code>
                      </td>
                      <td>{typeOf(p.schema)}</td>
                      <td>{p.description ?? (p.schema.description as string | undefined) ?? ""}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            <h3>Example</h3>
            <pre className={styles.code}>{curl}</pre>
            <pre className={styles.code}>{JSON.stringify(trim(ex.response()), null, 2)}</pre>
          </section>
        );
      })}
    </div>
  );
}
