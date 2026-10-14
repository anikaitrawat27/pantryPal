import { Suspense } from "react";
import { SignupForm } from "@/components/auth/SignupForm";
import { getDict } from "@/i18n/dict";
import { pageMeta } from "@/views/meta";

const t = getDict("es").meta;
export const metadata = { ...pageMeta("es", "/signup", t.signupTitle, t.authDescription), robots: { index: false } };

export default function Page() {
  return (
    <div className="container" lang="es">
      <Suspense fallback={null}>
        <SignupForm />
      </Suspense>
    </div>
  );
}
