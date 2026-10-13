import { getDict } from "@/i18n/dict";
import { pageMeta } from "@/views/meta";
import { AboutView } from "@/views/AboutView";

const t = getDict("en").meta;
export const metadata = pageMeta("en", "/about", t.aboutTitle, t.aboutDescription);

export default function Page() {
  return <AboutView lang="en" />;
}
