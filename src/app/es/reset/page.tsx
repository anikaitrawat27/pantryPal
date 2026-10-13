import { Suspense } from "react";
import { ResetForm } from "@/components/AuthForms";
import { getDict } from "@/i18n/dict";
import { pageMeta } from "@/views/meta";

const t = getDict("es").meta;
export const metadata = { ...pageMeta("es", "/reset", t.resetTitle, t.authDescription), robots: { index: false } };

export default function Page() {
  return (
    <div className="container" lang="es">
      <Suspense fallback={null}>
        <ResetForm />
      </Suspense>
    </div>
  );
}
