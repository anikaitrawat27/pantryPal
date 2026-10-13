import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CourseDoodle, ToolIcon } from "@/components/Doodle";
import { FavoriteButton } from "@/components/FavoriteButton";
import { PrintButton } from "@/components/PrintButton";
import { RecipeBody } from "@/components/RecipeBody";
import { RecipeCard } from "@/components/RecipeCard";
import { getRecipe, RECIPES, toSummary } from "@/lib/catalog";
import { COURSE_LABELS, CUISINE_LABELS, DIFFICULTY_LABELS, EQUIPMENT_LABELS, formatMinutes } from "@/lib/labels";
import styles from "./page.module.css";

type Params = { params: Promise<{ slug: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return RECIPES.map((r) => ({ slug: r.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const recipe = getRecipe((await params).slug);
  if (!recipe) return {};
  return {
    title: recipe.title,
    description: recipe.blurb,
    openGraph: { title: `${recipe.title} · Pantry Pal`, description: recipe.blurb },
  };
}

/** Up to three other recipes from the same course, chosen deterministically. */
function related(slug: string, course: string) {
  const pool = RECIPES.filter((r) => r.course === course && r.slug !== slug);
  const start = [...slug].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7) % Math.max(pool.length, 1);
  return [...pool.slice(start), ...pool.slice(0, start)].slice(0, 3);
}

export default async function RecipePage({ params }: Params) {
  const recipe = getRecipe((await params).slug);
  if (!recipe) notFound();

  return (
    <div className="container">
      <nav aria-label="Breadcrumb" className={`${styles.crumbs} no-print`}>
        <Link href="/recipes">All recipes</Link>
        <span aria-hidden="true"> / </span>
        <Link href={`/recipes?course=${recipe.course}`}>{COURSE_LABELS[recipe.course]}</Link>
      </nav>

      <header className={styles.header}>
        <CourseDoodle course={recipe.course} size={110} className={styles.doodle} />
        <div>
          <h1 className={styles.title}>
            <span className="highlight">{recipe.title}</span>
          </h1>
          <p className={styles.blurb}>{recipe.blurb}</p>
          <dl className={styles.facts}>
            <div>
              <dt>Prep</dt>
              <dd>{formatMinutes(recipe.prep)}</dd>
            </div>
            <div>
              <dt>Cook</dt>
              <dd>{recipe.cook ? formatMinutes(recipe.cook) : "None"}</dd>
            </div>
            <div>
              <dt>Level</dt>
              <dd>{DIFFICULTY_LABELS[recipe.difficulty]}</dd>
            </div>
            <div>
              <dt>Cuisine</dt>
              <dd>{CUISINE_LABELS[recipe.cuisine]}</dd>
            </div>
            <div>
              <dt>Tools</dt>
              <dd className={styles.tools}>
                {recipe.equipment.map((e) => (
                  <span key={e}>
                    <ToolIcon tool={e} size={20} /> {EQUIPMENT_LABELS[e]}
                  </span>
                ))}
              </dd>
            </div>
          </dl>
          <div className={`${styles.actions} no-print`}>
            <FavoriteButton slug={recipe.slug} title={recipe.title} />
            <PrintButton />
          </div>
        </div>
      </header>

      <RecipeBody ingredients={recipe.ingredients} steps={recipe.steps} baseServings={recipe.serves} />

      {recipe.tips && recipe.tips.length > 0 && (
        <aside className={styles.tips} aria-labelledby="tips-heading">
          <h2 id="tips-heading">Tips</h2>
          <ul>
            {recipe.tips.map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ul>
        </aside>
      )}

      <section className={`${styles.related} no-print`} aria-labelledby="related-heading">
        <h2 id="related-heading">More {COURSE_LABELS[recipe.course].toLowerCase()}</h2>
        <div className={styles.grid}>
          {related(recipe.slug, recipe.course).map((r, i) => (
            <RecipeCard key={r.slug} recipe={toSummary(r)} index={i} />
          ))}
        </div>
      </section>
    </div>
  );
}
