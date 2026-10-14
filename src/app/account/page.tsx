import { Suspense } from "react";
import { AccountPanel } from "@/components/auth/AccountPanel";
import { getDict } from "@/i18n/dict";
import { pageMeta } from "@/views/meta";

const t = getDict("en").meta;
export const metadata = { ...pageMeta("en", "/account", t.accountTitle, t.authDescription), robots: { index: false } };

export default function Page() {
  return (
    <div className="container" lang="en">
      <Suspense fallback={null}>
        <AccountPanel />
      </Suspense>
    </div>
  );
}
