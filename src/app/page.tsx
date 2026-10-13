import Link from "next/link";
import { CourseDoodle, JarLogo, ToolIcon } from "@/components/Doodle";
import { PantrySearch } from "@/components/PantrySearch";
import { RandomRecipeButton } from "@/components/RandomRecipeButton";
import ui from "@/components/ui.module.css";
import { COURSES, type Equipment } from "@/data/schema";
import { RECIPES } from "@/lib/catalog";
import { COURSE_LABELS, EQUIPMENT_LABELS } from "@/lib/labels";
import styles from "./page.module.css";

const TOOLS: Equipment[] = ["microwave", "stovetop", "blender", "no-cook"];

export default function Home() {
  const counts = Object.fromEntries(COURSES.map((c) => [c, RECIPES.filter((r) => r.course === c).length]));
  return (
    <div className="container">
      <section className={styles.hero}>
        <div className={styles.heroText}>
          <h1 className={styles.title}>
            Cook something good with <span className="highlight">what you already have</span>
          </h1>
          <p className={styles.lede}>
            {RECIPES.length} easy recipes made only from food pantry staples. No oven, no fancy gadgets, no special trips to the store.
          </p>
          <PantrySearch />
          <div className={styles.heroActions}>
            <Link href="/recipes" className={ui.button}>
              Browse all recipes
            </Link>
            <RandomRecipeButton slugs={RECIPES.map((r) => r.slug)} />
          </div>
        </div>
        <div className={styles.mascot} aria-hidden="true">
          <JarLogo size={220} />
        </div>
      </section>

      <section aria-labelledby="courses-heading" className={styles.section}>
        <h2 id="courses-heading">Pick a shelf</h2>
        <ul className={styles.tiles}>
          {COURSES.map((c, i) => (
            <li key={c}>
              <Link href={`/recipes?course=${c}`} className={`${ui.card} ${styles.tile}`} style={{ "--tilt": `${[-1.5, 1, -0.6, 1.4][i % 4]}deg` } as React.CSSProperties}>
                <CourseDoodle course={c} size={72} />
                <span className={styles.tileName}>{COURSE_LABELS[c]}</span>
                <span className={styles.tileCount}>{counts[c]} recipes</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="rules-heading" className={`${styles.section} ${styles.rules}`}>
        <h2 id="rules-heading">The house rules</h2>
        <ol className={styles.ruleList}>
          <li>
            <h3>Pantry ingredients only</h3>
            <p>
              Every recipe uses items food pantries commonly hand out. A few use basic seasonings, marked as{" "}
              <Link href="/pantry">extras</Link>, and you can hide those.
            </p>
          </li>
          <li>
            <h3>No oven</h3>
            <p>Everything is made with a few simple tools.</p>
            <span className={styles.toolList}>
              {TOOLS.map((t) => (
                <span key={t}>
                  <ToolIcon tool={t} size={22} /> {EQUIPMENT_LABELS[t]}
                </span>
              ))}
            </span>
          </li>
          <li>
            <h3>Make it fit</h3>
            <p>Scale any recipe from 1 to 6 servings, and swap ingredients for ones you have.</p>
          </li>
        </ol>
      </section>
    </div>
  );
}
