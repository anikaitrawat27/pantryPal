import { Suspense } from "react";
import { ResetForm } from "@/components/AuthForms";
import { getDict } from "@/i18n/dict";
import { pageMeta } from "@/views/meta";

const t = getDict("en").meta;
export const metadata = { ...pageMeta("en", "/reset", t.resetTitle, t.authDescription), robots: { index: false } };

export default function Page() {
  return (
    <div className="container" lang="en">
      <Suspense fallback={null}>
        <ResetForm />
      </Suspense>
    </div>
  );
}
