import { Suspense } from "react";
import { LoginForm } from "@/components/auth/LoginForm";
import { getDict } from "@/i18n/dict";
import { pageMeta } from "@/views/meta";

const t = getDict("en").meta;
export const metadata = { ...pageMeta("en", "/login", t.loginTitle, t.authDescription), robots: { index: false } };

export default function Page() {
  return (
    <div className="container" lang="en">
      <Suspense fallback={null}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
