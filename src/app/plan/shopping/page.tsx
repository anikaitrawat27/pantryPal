import type { Metadata } from "next";
import Link from "next/link";
import { ShoppingListView } from "@/components/ShoppingListView";
import { RECIPES, toSummary } from "@/lib/catalog";

export const metadata: Metadata = {
  title: "Shopping list",
  description: "Everything your meal plan needs, added together and grouped by aisle.",
};

export default function ShoppingPage() {
  return (
    <div className="container">
      <nav aria-label="Breadcrumb" className="no-print" style={{ fontWeight: 700, marginBottom: 12 }}>
        <Link href="/plan">Meal plan</Link> / Shopping list
      </nav>
      <h1>
        <span className="highlight">Shopping list</span>
      </h1>
      <ShoppingListView recipes={RECIPES.map(toSummary)} />
    </div>
  );
}
