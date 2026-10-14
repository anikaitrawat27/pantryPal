"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useDict, useLang } from "@/i18n/client";
import { localePath } from "@/i18n/config";
import ui from "./ui.module.css";

/** Shown on account-only pages to guests: a message and a sign-in link that returns here. */
export function SignInGate({ message }: { message: string }) {
  const d = useDict();
  const lang = useLang();
  const pathname = usePathname();
  return (
    <div className={ui.card} style={{ maxWidth: 560, padding: "20px 24px" }}>
      <p>{message}</p>
      <Link
        href={`${localePath(lang, "/login")}?next=${encodeURIComponent(pathname)}`}
        className={`${ui.button} ${ui.primary}`}
      >
        {d.auth.signIn}
      </Link>
    </div>
  );
}
