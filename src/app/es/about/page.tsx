import { getDict } from "@/i18n/dict";
import { pageMeta } from "@/views/meta";
import { AboutView } from "@/views/AboutView";

const t = getDict("es").meta;
export const metadata = pageMeta("es", "/about", t.aboutTitle, t.aboutDescription);

export default function Page() {
  return <AboutView lang="es" />;
}
