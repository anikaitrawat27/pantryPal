import { getDict } from "@/i18n/dict";
import { pageMeta } from "@/views/meta";
import { ShoppingView } from "@/views/ShoppingView";

const t = getDict("es").meta;
export const metadata = pageMeta("es", "/plan/shopping", t.shoppingTitle, t.shoppingDescription);

export default function Page() {
  return <ShoppingView lang="es" />;
}
