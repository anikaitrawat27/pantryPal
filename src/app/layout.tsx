import type { Metadata, Viewport } from "next";
import { Kalam, Nunito } from "next/font/google";
import { SiteFooter, SiteHeader } from "@/components/layout/SiteHeader";
import { getDict } from "@/i18n/dict";
import "./globals.css";
import styles from "./layout.module.css";

// Kalam covers Spanish accents (á, é, ñ, ¿) and has a true bold, unlike most handwritten faces.
const kalam = Kalam({ subsets: ["latin", "latin-ext"], weight: ["400", "700"], variable: "--font-hand-face" });
const nunito = Nunito({ subsets: ["latin", "latin-ext"], variable: "--font-nunito" });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://pantry-pal.vercel.app"),
  title: { default: "Pantry Pal", template: "%s · Pantry Pal" },
  description: getDict("en").meta.siteDescription,
  openGraph: { siteName: "Pantry Pal", type: "website" },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fbf6ec" },
    { media: "(prefers-color-scheme: dark)", color: "#22292a" },
  ],
};

/**
 * Runs before first paint: applies a saved theme so the page does not flash, and
 * sets the document language for Spanish pages (one root layout serves both languages).
 */
const BOOT_SCRIPT = `try{var t=localStorage.getItem("pantrypal:theme");if(t==="light"||t==="dark")document.documentElement.dataset.theme=t}catch(e){}if(/^\\/es(\\/|$)/.test(location.pathname))document.documentElement.lang="es";`;

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${kalam.variable} ${nunito.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: BOOT_SCRIPT }} />
      </head>
      <body>
        <SiteHeader />
        <main id="main" className={styles.main}>
          {children}
        </main>
        <SiteFooter />
      </body>
    </html>
  );
}
