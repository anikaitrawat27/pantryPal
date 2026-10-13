import { PlanBoard } from "@/components/PlanBoard";
import type { Lang } from "@/i18n/config";
import { getDict } from "@/i18n/dict";
import { RECIPES, toSummary } from "@/lib/catalog";

export function PlanView({ lang }: { lang: Lang }) {
  return (
    <div className="container" lang={lang}>
      <h1>
        <span className="highlight">{getDict(lang).plan.heading}</span>
      </h1>
      <PlanBoard recipes={RECIPES.map((r) => toSummary(r, lang))} />
    </div>
  );
}
