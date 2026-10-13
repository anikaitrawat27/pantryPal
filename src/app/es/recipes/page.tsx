import { getDict } from "@/i18n/dict";
import { pageMeta } from "@/views/meta";
import { RecipesView } from "@/views/RecipesView";

const t = getDict("es").meta;
export const metadata = pageMeta("es", "/recipes", t.recipesTitle, t.recipesDescription);

export default function Page() {
  return <RecipesView lang="es" />;
}
