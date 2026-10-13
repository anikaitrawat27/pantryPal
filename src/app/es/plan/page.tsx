import { getDict } from "@/i18n/dict";
import { pageMeta } from "@/views/meta";
import { PlanView } from "@/views/PlanView";

const t = getDict("es").meta;
export const metadata = pageMeta("es", "/plan", t.planTitle, t.planDescription);

export default function Page() {
  return <PlanView lang="es" />;
}
