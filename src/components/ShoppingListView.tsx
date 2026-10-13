"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { IngredientGroup } from "@/data/pantry";
import { useDict, useLang } from "@/i18n/client";
import { localePath } from "@/i18n/config";
import { packLabel } from "@/i18n/ingredients";
import type { RecipeSummary } from "@/lib/catalog";
import { useMyPantry } from "@/lib/my-pantry";
import { formatUsd } from "@/lib/nutrition";
import { usePlan } from "@/lib/plan-store";
import { buildShoppingList, shoppingListText, type ShoppingItem } from "@/lib/shopping";
import styles from "./ShoppingListView.module.css";
import ui from "./ui.module.css";

export function ShoppingListView({ recipes }: { recipes: RecipeSummary[] }) {
  const { plan, toggleChecked, clearChecked } = usePlan();
  const lang = useLang();
  const d = useDict();
  const t = d.shopping;
  const { pantry } = useMyPantry();
  const [copied, setCopied] = useState(false);

  const bySlug = useMemo(() => new Map(recipes.map((r) => [r.slug, r])), [recipes]);
  const list = useMemo(() => buildShoppingList(plan.entries, bySlug, pantry, lang), [plan.entries, bySlug, pantry, lang]);

  const toBuy = list.items.filter((i) => i.status !== "have");
  const have = list.items.filter((i) => i.status === "have");
  const groups = [...new Set(toBuy.map((i) => i.group))] as IngredientGroup[];
  const remaining = toBuy.filter((i) => !plan.checked.includes(i.id));

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(shoppingListText(list, plan.checked, (l) => packLabel(l, lang)));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      window.alert(t.copyBlocked);
    }
  };

  if (list.items.length === 0) {
    return (
      <div className={styles.empty}>
        <p className="hand">{t.emptyTitle}</p>
        <p>
          {t.emptyBodyStart} <Link href={localePath(lang, "/plan")}>{t.emptyLink}</Link> {t.emptyBodyEnd}
        </p>
      </div>
    );
  }

  const renderItem = (item: ShoppingItem) => {
    const done = plan.checked.includes(item.id);
    return (
      <li key={item.id} className={styles.item} data-done={done}>
        <label>
          <input type="checkbox" checked={done} onChange={() => toggleChecked(item.id)} />
          <span>
            <span className={styles.line}>{item.line}</span>
            {item.status === "low" && <span className={styles.low}>{t.low}</span>}
            <small>
              {item.packages > 0 && item.packLabel && t.buy(item.packages, packLabel(item.packLabel, lang), formatUsd(item.cost))}
              {item.recipes.length > 0 ? t.for(item.recipes.join(", ")) : t.restock}
            </small>
          </span>
        </label>
      </li>
    );
  };

  return (
    <div className={styles.wrap}>
      <div className={`${ui.card} ${styles.summary}`}>
        <div>
          <p className={styles.total}>
            {t.about} <strong className="hand">{formatUsd(list.total)}</strong>
          </p>
          <p className={styles.sub}>
            {t.left(remaining.length, toBuy.length, plan.entries.length)}
          </p>
        </div>
        <div className={`${styles.actions} no-print`}>
          <button type="button" className={ui.button} onClick={copy}>
            {copied ? t.copied : t.copy}
          </button>
          <button type="button" className={ui.button} onClick={() => window.print()}>
            {t.print}
          </button>
          {plan.checked.length > 0 && (
            <button type="button" className={styles.linkBtn} onClick={clearChecked}>
              {t.uncheck}
            </button>
          )}
        </div>
      </div>
      <p className={styles.note}>
        {t.noteStart} <Link href={localePath(lang, "/pantry")}>{t.noteLink}</Link> {t.noteEnd}
      </p>

      {groups.map((g) => (
        <section key={g} className={styles.group} aria-labelledby={`aisle-${g}`}>
          <h2 id={`aisle-${g}`}>{d.groups[g]}</h2>
          <ul>{toBuy.filter((i) => i.group === g).map(renderItem)}</ul>
        </section>
      ))}

      {have.length > 0 && (
        <details className={styles.have}>
          <summary>{t.have(have.length)}</summary>
          <ul>
            {have.map((i) => (
              <li key={i.id}>
                {i.line} <small>{t.for(i.recipes.join(", "))}</small>
              </li>
            ))}
          </ul>
        </details>
      )}
    </div>
  );
}
