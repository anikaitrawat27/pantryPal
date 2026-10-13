"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { GROUP_LABELS, type IngredientGroup } from "@/data/pantry";
import type { RecipeSummary } from "@/lib/catalog";
import { useMyPantry } from "@/lib/my-pantry";
import { formatUsd } from "@/lib/nutrition";
import { usePlan } from "@/lib/plan-store";
import { buildShoppingList, shoppingListText, type ShoppingItem } from "@/lib/shopping";
import styles from "./ShoppingListView.module.css";
import ui from "./ui.module.css";

export function ShoppingListView({ recipes }: { recipes: RecipeSummary[] }) {
  const { plan, toggleChecked, clearChecked } = usePlan();
  const { pantry } = useMyPantry();
  const [copied, setCopied] = useState(false);

  const bySlug = useMemo(() => new Map(recipes.map((r) => [r.slug, r])), [recipes]);
  const list = useMemo(() => buildShoppingList(plan.entries, bySlug, pantry), [plan.entries, bySlug, pantry]);

  const toBuy = list.items.filter((i) => i.status !== "have");
  const have = list.items.filter((i) => i.status === "have");
  const groups = [...new Set(toBuy.map((i) => i.group))] as IngredientGroup[];
  const remaining = toBuy.filter((i) => !plan.checked.includes(i.id));

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(shoppingListText(list, plan.checked));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      window.alert("Copying is blocked in this browser. Use Print instead.");
    }
  };

  if (plan.entries.length === 0) {
    return (
      <div className={styles.empty}>
        <p className="hand">Your list is empty.</p>
        <p>
          Add recipes to your <Link href="/plan">meal plan</Link> and the ingredients show up here, added together.
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
            {item.status === "low" && <span className={styles.low}>running low</span>}
            <small>
              {item.packages > 0 && item.packLabel && `Buy ${item.packages} × ${item.packLabel} · ${formatUsd(item.cost)} · `}
              for {item.recipes.join(", ")}
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
            About <strong className="hand">{formatUsd(list.total)}</strong>
          </p>
          <p className={styles.sub}>
            {remaining.length} of {toBuy.length} items left · {plan.entries.length} planned meals
          </p>
        </div>
        <div className={`${styles.actions} no-print`}>
          <button type="button" className={ui.button} onClick={copy}>
            {copied ? "Copied" : "Copy list"}
          </button>
          <button type="button" className={ui.button} onClick={() => window.print()}>
            Print
          </button>
          {plan.checked.length > 0 && (
            <button type="button" className={styles.linkBtn} onClick={clearChecked}>
              Uncheck all
            </button>
          )}
        </div>
      </div>
      <p className={styles.note}>
        Prices are rough U.S. estimates for whole packages. Salt, pepper, and oil are assumed. Items in{" "}
        <Link href="/pantry">your pantry</Link> are left off unless marked low.
      </p>

      {groups.map((g) => (
        <section key={g} className={styles.group} aria-labelledby={`aisle-${g}`}>
          <h2 id={`aisle-${g}`}>{GROUP_LABELS[g]}</h2>
          <ul>{toBuy.filter((i) => i.group === g).map(renderItem)}</ul>
        </section>
      ))}

      {have.length > 0 && (
        <details className={styles.have}>
          <summary>Already have ({have.length})</summary>
          <ul>
            {have.map((i) => (
              <li key={i.id}>
                {i.line} <small>for {i.recipes.join(", ")}</small>
              </li>
            ))}
          </ul>
        </details>
      )}
    </div>
  );
}
