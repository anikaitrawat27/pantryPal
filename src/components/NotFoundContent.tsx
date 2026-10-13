"use client";

import Link from "next/link";
import { useDict, useLang } from "@/i18n/client";
import { localePath } from "@/i18n/config";
import { JarLogo } from "./Doodle";
import ui from "./ui.module.css";

/** 404 content in the language of the requested URL. */
export function NotFoundContent() {
  const lang = useLang();
  const t = useDict().notFound;
  return (
    <div className="container" style={{ textAlign: "center", paddingTop: 32 }} lang={lang}>
      <JarLogo size={140} className="not-found-jar" />
      <h1>{t.title}</h1>
      <p>{t.body}</p>
      <Link href={localePath(lang, "/recipes")} className={ui.button}>
        {t.browse}
      </Link>
    </div>
  );
}
