import { Suspense } from "react";
import { MyRecipesView } from "@/components/MyRecipesView";
import { getDict } from "@/i18n/dict";
import { pageMeta } from "@/views/meta";

const t = getDict("en").meta;
export const metadata = {
  ...pageMeta("en", "/my-recipes", t.myRecipesTitle, t.chatDescription),
  robots: { index: false },
};

export default function Page() {
  return (
    <div className="container" lang="en">
      <Suspense fallback={null}>
        <MyRecipesView />
      </Suspense>
    </div>
  );
}
