import { Suspense } from "react";
import { SignupForm } from "@/components/AuthForms";
import { getDict } from "@/i18n/dict";
import { pageMeta } from "@/views/meta";

const t = getDict("en").meta;
export const metadata = { ...pageMeta("en", "/signup", t.signupTitle, t.authDescription), robots: { index: false } };

export default function Page() {
  return (
    <div className="container" lang="en">
      <Suspense fallback={null}>
        <SignupForm />
      </Suspense>
    </div>
  );
}
