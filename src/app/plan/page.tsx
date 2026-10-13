import { getDict } from "@/i18n/dict";
import { pageMeta } from "@/views/meta";
import { PlanView } from "@/views/PlanView";

const t = getDict("en").meta;
export const metadata = pageMeta("en", "/plan", t.planTitle, t.planDescription);

export default function Page() {
  return <PlanView lang="en" />;
}
