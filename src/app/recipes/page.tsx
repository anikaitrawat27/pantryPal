import type { Metadata } from "next";
import { Suspense } from "react";
import { RecipeBrowser } from "@/components/RecipeBrowser";
import { RECIPES, toSummary } from "@/lib/catalog";

export const metadata: Metadata = {
  title: "All recipes",
  description: "Browse and filter 250 pantry recipes by course, meal, cuisine, diet, tools, and the ingredients you have.",
};

export default function RecipesPage() {
  const summaries = RECIPES.map(toSummary);
  return (
    <div className="container">
      <h1>
        <span className="highlight">All recipes</span>
      </h1>
      <Suspense fallback={<p className="hand">Opening the pantry…</p>}>
        <RecipeBrowser recipes={summaries} />
      </Suspense>
    </div>
  );
}
