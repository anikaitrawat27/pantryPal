"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useDict, useLang } from "@/i18n/client";
import { localePath } from "@/i18n/config";
import { useAccount } from "@/client/account";
import { formatUsd } from "@/lib/nutrition";
import { getGeneratedRecipe, listSavedRecipes, setRecipeSaved, type SavedRecipe } from "@/client/chat";
import { CourseDoodle } from "../Doodle";
import styles from "./MyRecipesView.module.css";
import { RecipeBody } from "../recipe/RecipeBody";
import { SignInGate } from "../SignInGate";
import ui from "../ui.module.css";

type Saved = SavedRecipe;

function useText(r: Saved) {
  const lang = useLang();
  const english = Object.fromEntries(r.recipe.ingredients.filter((i) => i.note).map((i) => [i.id, i.note!]));
  if (lang === "es" && r.es) return { ...r.es, tips: r.es.tips ?? [], notes: { ...english, ...r.es.notes } };
  return {
    title: r.recipe.title,
    blurb: r.recipe.blurb,
    steps: r.recipe.steps,
    tips: r.recipe.tips ?? [],
    notes: english,
  };
}

function One({ r }: { r: Saved }) {
  const d = useDict();
  const t = d.myRecipes;
  const router = useRouter();
  const pathname = usePathname();
  const text = useText(r);
  const recipe = r.recipe;
  return (
    <div>
      <p className={styles.back}>
        <Link href={pathname}>← {t.back}</Link>
      </p>
      <header className={styles.header}>
        <CourseDoodle course={recipe.course} size={96} />
        <div>
          <p className={styles.badge}>{d.chat.newRecipe}</p>
          <h1>
            <span className="highlight">{text.title}</span>
          </h1>
          <p className={styles.blurb}>{text.blurb}</p>
          <p className={styles.meta}>
            {d.units.minutes(recipe.prep + recipe.cook)} · {d.difficulty[recipe.difficulty]} ·{" "}
            {d.cuisines[recipe.cuisine]} · {recipe.equipment.map((e) => d.equipment[e]).join(", ")}
          </p>
          <p className={styles.checked}>✓ {d.chat.checked}</p>
          {r.saved && (
            <button
              type="button"
              className={ui.button}
              onClick={async () => {
                await setRecipeSaved(r.id, false);
                router.replace(pathname);
              }}
            >
              {t.remove}
            </button>
          )}
        </div>
      </header>
      <RecipeBody
        slug={r.recipe.slug}
        title={text.title}
        meal={recipe.meal[0]}
        ingredients={recipe.ingredients}
        notes={text.notes}
        steps={text.steps}
        baseServings={recipe.serves}
        plannable={false}
      />
      {text.tips.length > 0 && (
        <aside className={styles.tips}>
          <h2>{d.recipe.tips}</h2>
          <ul>
            {text.tips.map((tip) => (
              <li key={tip}>{tip}</li>
            ))}
          </ul>
        </aside>
      )}
    </div>
  );
}

function Card({ r }: { r: Saved }) {
  const d = useDict();
  const pathname = usePathname();
  const text = useText(r);
  return (
    <Link href={`${pathname}?id=${r.id}`} className={`${ui.card} ${styles.card}`}>
      <CourseDoodle course={r.recipe.course} size={48} />
      <h3>{text.title}</h3>
      <p>{text.blurb}</p>
      <small>
        {d.units.minutes(r.recipe.prep + r.recipe.cook)} · {formatUsd(r.costPerServingUsd)}
      </small>
    </Link>
  );
}

export function MyRecipesView() {
  const d = useDict();
  const t = d.myRecipes;
  const lang = useLang();
  const account = useAccount();
  const id = useSearchParams().get("id");
  const [list, setList] = useState<Saved[] | null>(null);
  const [one, setOne] = useState<Saved | "missing" | null>(null);

  useEffect(() => {
    if (account.status !== "user") return;
    if (id) {
      setOne(null);
      getGeneratedRecipe(id)
        .then(setOne)
        .catch(() => setOne("missing"));
    } else {
      listSavedRecipes()
        .then(setList)
        .catch(() => setList([]));
    }
  }, [id, account.status]);

  if (account.status === "loading") return null;
  if (account.status === "guest") return <SignInGate message={t.signIn} />;
  if (id) {
    if (one === null) return null;
    if (one === "missing") return <p>{t.notFound}</p>;
    return <One r={one} />;
  }
  return (
    <div>
      <h1>
        <span className="highlight">{t.title}</span>
      </h1>
      <p className={styles.blurb}>{t.intro}</p>
      {list && list.length === 0 && (
        <div className={styles.emptyState}>
          <p>{t.empty}</p>
          <Link href={localePath(lang, "/chat")} className={`${ui.button} ${ui.primary}`}>
            {t.goChat}
          </Link>
        </div>
      )}
      <div className={styles.grid}>
        {list?.map((r) => (
          <Card key={r.id} r={r} />
        ))}
      </div>
    </div>
  );
}
