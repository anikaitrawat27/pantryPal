import { HomeView } from "@/views/HomeView";
import { pageMeta } from "@/views/meta";
import { getDict } from "@/i18n/dict";

export const metadata = pageMeta("es", "/", "Pantry Pal", getDict("es").meta.siteDescription);

export default function Page() {
  return <HomeView lang="es" />;
}
