import { Suspense } from "react";
import { MyRecipesView } from "@/components/my-recipes/MyRecipesView";
import { getDict } from "@/i18n/dict";
import { pageMeta } from "@/views/meta";

const t = getDict("es").meta;
export const metadata = {
  ...pageMeta("es", "/my-recipes", t.myRecipesTitle, t.chatDescription),
  robots: { index: false },
};

export default function Page() {
  return (
    <div className="container" lang="es">
      <Suspense fallback={null}>
        <MyRecipesView />
      </Suspense>
    </div>
  );
}
