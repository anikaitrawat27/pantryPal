import { getDict } from "@/i18n/dict";
import { pageMeta } from "@/views/meta";
import { FavoritesView } from "@/views/FavoritesView";

const t = getDict("es").meta;
export const metadata = pageMeta("es", "/favorites", t.favoritesTitle, t.favoritesDescription);

export default function Page() {
  return <FavoritesView lang="es" />;
}
