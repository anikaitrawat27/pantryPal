import type { Metadata } from "next";
import { PlanBoard } from "@/components/PlanBoard";
import { RECIPES, toSummary } from "@/lib/catalog";

export const metadata: Metadata = {
  title: "Meal plan",
  description: "Plan a week of pantry meals and get one combined shopping list.",
};

export default function PlanPage() {
  return (
    <div className="container">
      <h1>
        <span className="highlight">This week&apos;s plan</span>
      </h1>
      <PlanBoard recipes={RECIPES.map(toSummary)} />
    </div>
  );
}
