"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Suspense, useEffect } from "react";
import { useDict, useLang } from "@/i18n/client";
import { localePath, switchLangPath } from "@/i18n/config";
import { loadAccount, useAccount } from "@/client/account";
import { JarLogo, Squiggle } from "../Doodle";
import styles from "./SiteHeader.module.css";
import { ThemeToggle } from "./ThemeToggle";

/** Links to the same page in the other language, keeping any filters in the query string. */
function LangSwitch() {
  const lang = useLang();
  const t = useDict().nav;
  const pathname = usePathname() ?? "/";
  const query = useSearchParams()?.toString();
  const target = switchLangPath(pathname, lang === "en" ? "es" : "en");
  return (
    <Link
      href={query ? `${target}?${query}` : target}
      hrefLang={lang === "en" ? "es" : "en"}
      lang={lang === "en" ? "es" : "en"}
      aria-label={t.switchLabel}
      className={styles.lang}
    >
      {t.switchTo}
    </Link>
  );
}

/** "Sign in" for guests (returning here afterwards), or the username linking to the account page. */
function AccountLink() {
  const lang = useLang();
  const t = useDict().auth;
  const account = useAccount();
  const pathname = usePathname() ?? "/";
  useEffect(() => {
    void loadAccount();
  }, []);
  if (account.status === "user") {
    return (
      <Link href={localePath(lang, "/account")} className={styles.account} data-testid="account-link">
        {account.username}
      </Link>
    );
  }
  const authPage = /\/(login|signup|reset)$/.test(pathname);
  return (
    <Link
      href={`${localePath(lang, "/login")}${authPage ? "" : `?next=${encodeURIComponent(pathname)}`}`}
      className={styles.account}
      aria-busy={account.status === "loading"}
    >
      {t.signIn}
    </Link>
  );
}

export function SiteHeader() {
  const lang = useLang();
  const t = useDict().nav;
  // The boot script sets this on full page loads; keep it right after client-side navigation too.
  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);
  const href = (path: string) => localePath(lang, path);
  return (
    <>
      <a href="#main" className={styles.skip}>
        {t.skip}
      </a>
      <header className={`${styles.header} no-print`}>
        <div className={`container ${styles.headerInner}`}>
          <Link href={href("/")} className={styles.brand}>
            <JarLogo size={44} className={styles.logo} />
            <span>Pantry Pal</span>
          </Link>
          <nav aria-label={t.main} className={styles.nav}>
            <Link href={href("/recipes")}>{t.recipes}</Link>
            <Link href={href("/plan")}>{t.plan}</Link>
            <Link href={href("/chat")}>{t.chat}</Link>
            <Link href={href("/favorites")}>{t.favorites}</Link>
            <AccountLink />
            <Suspense fallback={null}>
              <LangSwitch />
            </Suspense>
            <ThemeToggle />
          </nav>
        </div>
        <Squiggle className={styles.squiggle} />
      </header>
    </>
  );
}

export function SiteFooter() {
  const t = useDict();
  const lang = useLang();
  return (
    <footer className={`${styles.footer} no-print`}>
      <div className="container">
        <p className="hand">{t.footer}</p>
        <p className={styles.footerLinks}>
          <Link href={localePath(lang, "/about")}>{t.nav.about}</Link>
          <Link href={localePath(lang, "/my-recipes")}>{t.nav.myRecipes}</Link>
          <Link href="/developers">API</Link>
        </p>
      </div>
    </footer>
  );
}
