import Link from "next/link";
import { CourseDoodle, JarLogo, ToolIcon } from "@/components/Doodle";
import { PantrySearch } from "@/components/PantrySearch";
import { RandomRecipeButton } from "@/components/RandomRecipeButton";
import ui from "@/components/ui.module.css";
import { COURSES, type Equipment } from "@/data/schema";
import { localePath, type Lang } from "@/i18n/config";
import { getDict } from "@/i18n/dict";
import { RECIPES } from "@/lib/catalog";
import styles from "./HomeView.module.css";

const TOOLS: Equipment[] = ["microwave", "stovetop", "blender", "no-cook"];

export function HomeView({ lang }: { lang: Lang }) {
  const d = getDict(lang);
  const t = d.home;
  const href = (p: string) => localePath(lang, p);
  const counts = Object.fromEntries(COURSES.map((c) => [c, RECIPES.filter((r) => r.course === c).length]));
  return (
    <div className="container" lang={lang}>
      <section className={styles.hero}>
        <div>
          <h1 className={styles.title}>
            {t.titleStart} <span className="highlight">{t.titleHighlight}</span>
          </h1>
          <p className={styles.lede}>{t.lede(RECIPES.length)}</p>
          <PantrySearch />
          <div className={styles.heroActions}>
            <Link href={href("/recipes")} className={ui.button}>
              {t.browse}
            </Link>
            <Link href={href("/plan")} className={ui.button}>
              {t.planWeek}
            </Link>
            <RandomRecipeButton slugs={RECIPES.map((r) => r.slug)} />
          </div>
        </div>
        <div className={styles.mascot} aria-hidden="true">
          <JarLogo size={220} />
        </div>
      </section>

      <section aria-labelledby="courses-heading" className={styles.section}>
        <h2 id="courses-heading">{t.shelvesHeading}</h2>
        <ul className={styles.tiles}>
          {COURSES.map((c, i) => (
            <li key={c}>
              <Link
                href={`${href("/recipes")}?course=${c}`}
                className={`${ui.card} ${styles.tile}`}
                style={{ "--tilt": `${[-1.5, 1, -0.6, 1.4][i % 4]}deg` } as React.CSSProperties}
              >
                <CourseDoodle course={c} size={72} />
                <span className={styles.tileName}>{d.courses[c]}</span>
                <span className={styles.tileCount}>{t.recipesCount(counts[c])}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="rules-heading" className={styles.section}>
        <h2 id="rules-heading">{t.rulesHeading}</h2>
        <ol className={styles.ruleList}>
          <li>
            <h3>{t.rule1Title}</h3>
            <p>
              {t.rule1Body} <Link href={href("/pantry")}>{t.rule1Link}</Link>
              {t.rule1End}
            </p>
          </li>
          <li>
            <h3>{t.rule2Title}</h3>
            <p>{t.rule2Body}</p>
            <span className={styles.toolList}>
              {TOOLS.map((tool) => (
                <span key={tool}>
                  <ToolIcon tool={tool} size={22} /> {d.equipment[tool]}
                </span>
              ))}
            </span>
          </li>
          <li>
            <h3>{t.rule3Title}</h3>
            <p>{t.rule3Body}</p>
          </li>
        </ol>
      </section>
    </div>
  );
}
