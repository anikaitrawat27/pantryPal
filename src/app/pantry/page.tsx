import { getDict } from "@/i18n/dict";
import { pageMeta } from "@/views/meta";
import { PantryView } from "@/views/PantryView";

const t = getDict("en").meta;
export const metadata = pageMeta("en", "/pantry", t.pantryTitle, t.pantryDescription);

export default function Page() {
  return <PantryView lang="en" />;
}
