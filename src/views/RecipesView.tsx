import { Suspense } from "react";
import { RecipeBrowser } from "@/components/browse/RecipeBrowser";
import type { Lang } from "@/i18n/config";
import { getDict } from "@/i18n/dict";
import { RECIPES, toSummary } from "@/lib/catalog";

export function RecipesView({ lang }: { lang: Lang }) {
  const t = getDict(lang).browse;
  return (
    <div className="container" lang={lang}>
      <h1>
        <span className="highlight">{t.heading}</span>
      </h1>
      <Suspense fallback={<p className="hand">{t.loading}</p>}>
        <RecipeBrowser recipes={RECIPES.map((r) => toSummary(r, lang))} />
      </Suspense>
    </div>
  );
}
