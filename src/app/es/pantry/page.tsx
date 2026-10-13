import { getDict } from "@/i18n/dict";
import { pageMeta } from "@/views/meta";
import { PantryView } from "@/views/PantryView";

const t = getDict("es").meta;
export const metadata = pageMeta("es", "/pantry", t.pantryTitle, t.pantryDescription);

export default function Page() {
  return <PantryView lang="es" />;
}
