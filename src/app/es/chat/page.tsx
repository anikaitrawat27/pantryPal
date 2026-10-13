import { Suspense } from "react";
import { ChatView } from "@/components/ChatView";
import { getDict } from "@/i18n/dict";
import { pageMeta } from "@/views/meta";

const t = getDict("es").meta;
export const metadata = { ...pageMeta("es", "/chat", t.chatTitle, t.chatDescription), robots: { index: false } };

export default function Page() {
  return (
    <div className="container" lang="es">
      <h1>
        <span className="highlight">{t.chatTitle}</span>
      </h1>
      <Suspense fallback={null}>
        <ChatView />
      </Suspense>
    </div>
  );
}
