import type { Metadata, Viewport } from "next";
import { Gaegu, Nunito } from "next/font/google";
import Link from "next/link";
import { JarLogo, Squiggle } from "@/components/Doodle";
import { ThemeToggle } from "@/components/ThemeToggle";
import "./globals.css";
import styles from "./layout.module.css";

const gaegu = Gaegu({ subsets: ["latin"], weight: ["400", "700"], variable: "--font-gaegu" });
const nunito = Nunito({ subsets: ["latin"], variable: "--font-nunito" });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://pantry-pal.vercel.app"),
  title: { default: "Pantry Pal", template: "%s · Pantry Pal" },
  description:
    "250 easy recipes made only from food pantry ingredients. No oven needed. Search by what you have, scale servings, and swap ingredients.",
  openGraph: { siteName: "Pantry Pal", type: "website" },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fbf6ec" },
    { media: "(prefers-color-scheme: dark)", color: "#22292a" },
  ],
};

/** Applies a saved theme before first paint so the page does not flash. */
const THEME_SCRIPT = `try{var t=localStorage.getItem("pantrypal:theme");if(t==="light"||t==="dark")document.documentElement.dataset.theme=t}catch(e){}`;

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${gaegu.variable} ${nunito.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
      </head>
      <body>
        <a href="#main" className={styles.skip}>
          Skip to content
        </a>
        <header className={`${styles.header} no-print`}>
          <div className={`container ${styles.headerInner}`}>
            <Link href="/" className={styles.brand}>
              <JarLogo size={44} className={styles.logo} />
              <span>Pantry Pal</span>
            </Link>
            <nav aria-label="Main" className={styles.nav}>
              <Link href="/recipes">Recipes</Link>
              <Link href="/pantry">My pantry</Link>
              <Link href="/plan">Plan</Link>
              <Link href="/favorites">Favorites</Link>
              <Link href="/about">About</Link>
              <ThemeToggle />
            </nav>
          </div>
          <Squiggle className={styles.squiggle} />
        </header>
        <main id="main" className={styles.main}>
          {children}
        </main>
        <footer className={`${styles.footer} no-print`}>
          <div className="container">
            <p className="hand">Made with what&apos;s on the shelf. No oven required.</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
