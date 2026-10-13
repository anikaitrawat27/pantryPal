import { getDict } from "@/i18n/dict";
import { pageMeta } from "@/views/meta";
import { FavoritesView } from "@/views/FavoritesView";

const t = getDict("en").meta;
export const metadata = pageMeta("en", "/favorites", t.favoritesTitle, t.favoritesDescription);

export default function Page() {
  return <FavoritesView lang="en" />;
}
