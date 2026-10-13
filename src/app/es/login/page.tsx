import { Suspense } from "react";
import { LoginForm } from "@/components/AuthForms";
import { getDict } from "@/i18n/dict";
import { pageMeta } from "@/views/meta";

const t = getDict("es").meta;
export const metadata = { ...pageMeta("es", "/login", t.loginTitle, t.authDescription), robots: { index: false } };

export default function Page() {
  return (
    <div className="container" lang="es">
      <Suspense fallback={null}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
