import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CourseDoodle, ToolIcon } from "@/components/Doodle";
import { FavoriteButton } from "@/components/FavoriteButton";
import { PrintButton } from "@/components/PrintButton";
import { RecipeBody } from "@/components/RecipeBody";
import { RecipeCard } from "@/components/RecipeCard";
import { localePath, type Lang } from "@/i18n/config";
import { getDict } from "@/i18n/dict";
import { localizeRecipe } from "@/i18n/recipes";
import { getRecipe, RECIPES, toSummary } from "@/lib/catalog";
import { pageMeta } from "./meta";
import styles from "./RecipeView.module.css";

export function recipeStaticParams() {
  return RECIPES.map((r) => ({ slug: r.slug }));
}

export function recipeMetadata(lang: Lang, slug: string): Metadata {
  const recipe = getRecipe(slug);
  if (!recipe) return {};
  const text = localizeRecipe(recipe, lang);
  return pageMeta(lang, `/recipes/${slug}`, text.title, text.blurb);
}

/** Up to three other recipes from the same course, chosen deterministically. */
function related(slug: string, course: string) {
  const pool = RECIPES.filter((r) => r.course === course && r.slug !== slug);
  const start = [...slug].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7) % Math.max(pool.length, 1);
  return [...pool.slice(start), ...pool.slice(0, start)].slice(0, 3);
}

export function RecipeView({ lang, slug }: { lang: Lang; slug: string }) {
  const recipe = getRecipe(slug);
  if (!recipe) notFound();
  const d = getDict(lang);
  const t = d.recipe;
  const text = localizeRecipe(recipe, lang);
  const href = (p: string) => localePath(lang, p);

  return (
    <div className="container" lang={lang}>
      <nav aria-label={t.breadcrumb} className={`${styles.crumbs} no-print`}>
        <Link href={href("/recipes")}>{t.all}</Link>
        <span aria-hidden="true"> / </span>
        <Link href={`${href("/recipes")}?course=${recipe.course}`}>{d.courses[recipe.course]}</Link>
      </nav>

      <header className={styles.header}>
        <CourseDoodle course={recipe.course} size={110} className={styles.doodle} />
        <div>
          <h1 className={styles.title}>
            <span className="highlight">{text.title}</span>
          </h1>
          <p className={styles.blurb}>{text.blurb}</p>
          <dl className={styles.facts}>
            <div>
              <dt>{t.prep}</dt>
              <dd>{d.units.minutes(recipe.prep)}</dd>
            </div>
            <div>
              <dt>{t.cook}</dt>
              <dd>{recipe.cook ? d.units.minutes(recipe.cook) : t.none}</dd>
            </div>
            <div>
              <dt>{t.level}</dt>
              <dd>{d.difficulty[recipe.difficulty]}</dd>
            </div>
            <div>
              <dt>{t.cuisine}</dt>
              <dd>{d.cuisines[recipe.cuisine]}</dd>
            </div>
            <div>
              <dt>{t.tools}</dt>
              <dd className={styles.tools}>
                {recipe.equipment.map((e) => (
                  <span key={e}>
                    <ToolIcon tool={e} size={20} /> {d.equipment[e]}
                  </span>
                ))}
              </dd>
            </div>
          </dl>
          <div className={`${styles.actions} no-print`}>
            <FavoriteButton slug={recipe.slug} title={text.title} />
            <PrintButton />
          </div>
        </div>
      </header>

      <RecipeBody
        slug={recipe.slug}
        title={text.title}
        meal={recipe.meal.includes("dinner") ? "dinner" : recipe.meal[0]}
        ingredients={recipe.ingredients}
        notes={text.notes}
        steps={text.steps}
        baseServings={recipe.serves}
      />

      {text.tips && text.tips.length > 0 && (
        <aside className={styles.tips} aria-labelledby="tips-heading">
          <h2 id="tips-heading">{t.tips}</h2>
          <ul>
            {text.tips.map((tip) => (
              <li key={tip}>{tip}</li>
            ))}
          </ul>
        </aside>
      )}

      <section className={`${styles.related} no-print`} aria-labelledby="related-heading">
        <h2 id="related-heading">{t.more(d.courses[recipe.course])}</h2>
        <div className={styles.grid}>
          {related(recipe.slug, recipe.course).map((r, i) => (
            <RecipeCard key={r.slug} recipe={toSummary(r, lang)} lang={lang} index={i} />
          ))}
        </div>
      </section>
    </div>
  );
}
