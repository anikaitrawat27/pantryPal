import Link from "next/link";
import { ShoppingListView } from "@/components/plan/ShoppingListView";
import { localePath, type Lang } from "@/i18n/config";
import { getDict } from "@/i18n/dict";

export function ShoppingView({ lang }: { lang: Lang }) {
  const t = getDict(lang).shopping;
  return (
    <div className="container" lang={lang}>
      <nav aria-label="Breadcrumb" className="no-print" style={{ fontWeight: 700, marginBottom: 12 }}>
        <Link href={localePath(lang, "/plan")}>{t.breadcrumbPlan}</Link> / {t.heading}
      </nav>
      <h1>
        <span className="highlight">{t.heading}</span>
      </h1>
      <ShoppingListView />
    </div>
  );
}
