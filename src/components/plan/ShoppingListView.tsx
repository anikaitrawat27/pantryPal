"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { IngredientGroup } from "@/data/pantry";
import { useDict, useLang } from "@/i18n/client";
import { localePath } from "@/i18n/config";
import { fetchShoppingList } from "@/client/api";
import type { ShoppingListResponse } from "@/lib/api/shopping-list";
import { formatUsd } from "@/lib/nutrition";
import { usePlan } from "@/client/plan-store";
import { shoppingTextLine } from "@/lib/shopping";
import styles from "./ShoppingListView.module.css";
import ui from "../ui.module.css";

type Item = ShoppingListResponse["items"][number];
type State = { status: "loading" } | { status: "error" } | { status: "ready"; list: ShoppingListResponse };

/**
 * The combined shopping list, computed by POST /api/shopping-list. Checkmarks stay
 * on the client so ticking an item is instant and does not refetch.
 */
export function ShoppingListView() {
  const { plan, toggleChecked, clearChecked } = usePlan();
  const lang = useLang();
  const d = useDict();
  const t = d.shopping;
  const [copied, setCopied] = useState(false);
  const [state, setState] = useState<State>({ status: "loading" });
  const [attempt, setAttempt] = useState(0);

  // Refetch when the plan or language changes; abort the previous request so a slow
  // response can never overwrite a newer one.
  const meals = plan.entries.map((e) => ({ slug: e.slug, servings: e.servings }));
  const requestKey = JSON.stringify([meals, lang]);
  useEffect(() => {
    const [m, l] = JSON.parse(requestKey) as [typeof meals, typeof lang];
    const controller = new AbortController();
    setState({ status: "loading" });
    // No pantry is sent, so every ingredient is listed to buy except salt, pepper, and oil.
    fetchShoppingList({ meals: m, lang: l }, controller.signal)
      .then((list) => setState({ status: "ready", list }))
      .catch((err: unknown) => {
        if (!controller.signal.aborted) {
          console.error("Shopping list request failed", err);
          setState({ status: "error" });
        }
      });
    return () => controller.abort();
  }, [requestKey, attempt]);

  if (state.status === "loading")
    return (
      <p className="hand" role="status">
        {t.loading}
      </p>
    );
  if (state.status === "error") {
    return (
      <div className={styles.empty} role="alert">
        <p>{t.error}</p>
        <button type="button" className={ui.button} onClick={() => setAttempt((a) => a + 1)}>
          {t.retry}
        </button>
      </div>
    );
  }

  const { list } = state;
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

  // Salt, pepper, and oil come back as "have"; they are assumed on hand and left off.
  const toBuy = list.items.filter((i) => i.status !== "have");
  const groups = [...new Set(toBuy.map((i) => i.group))] as IngredientGroup[];
  const remaining = toBuy.filter((i) => !plan.checked.includes(i.id));

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(
        remaining.map((i) => shoppingTextLine(i.line, i.packages, i.packageLabel)).join("\n"),
      );
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      window.alert(t.copyBlocked);
    }
  };

  const renderItem = (item: Item) => {
    const done = plan.checked.includes(item.id);
    return (
      <li key={item.id} className={styles.item} data-done={done}>
        <label>
          <input type="checkbox" checked={done} onChange={() => toggleChecked(item.id)} />
          <span>
            <span className={styles.line}>{item.line}</span>
            <small>
              {item.packages > 0 &&
                item.packageLabel &&
                t.buy(item.packages, item.packageLabel, formatUsd(item.costUsd))}
              {t.for(item.recipes.join(", "))}
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
            {t.about} <strong className="hand">{formatUsd(list.totalUsd)}</strong>
          </p>
          <p className={styles.sub}>{t.left(remaining.length, toBuy.length, plan.entries.length)}</p>
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
      <p className={styles.note}>{t.note}</p>

      {groups.map((g) => (
        <section key={g} className={styles.group} aria-labelledby={`aisle-${g}`}>
          <h2 id={`aisle-${g}`}>{d.groups[g]}</h2>
          <ul>{toBuy.filter((i) => i.group === g).map(renderItem)}</ul>
        </section>
      ))}
    </div>
  );
}
