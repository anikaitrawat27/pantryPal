import type { Course, Equipment } from "@/data/schema";

/**
 * Hand-drawn doodles. Strokes use `currentColor`; fills use the course accent
 * so the doodles follow the light and dark themes.
 */

const stroke = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2.6,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

/** Stroke styling plus a fill, for closed shapes. */
const filled = (fill: string, fillOpacity = 1) => ({ ...stroke, fill, fillOpacity });

export const COURSE_ACCENT: Record<Course, string> = {
  breakfast: "var(--mustard)",
  main: "var(--tomato)",
  soup: "var(--sky)",
  salad: "var(--sage)",
  appetizer: "var(--mustard)",
  side: "var(--sage)",
  drink: "var(--berry)",
  dessert: "var(--berry)",
};

const COURSE_ART: Record<Course, (accent: string) => React.ReactNode> = {
  breakfast: (a) => (
    <>
      <path d="M8 34c0-11 9-19 20-19s20 8 20 19-9 18-20 18S8 45 8 34z" {...stroke} />
      <path d="M47 38c5 1 9 2 12 4" {...stroke} strokeWidth={4.5} />
      <path d="M17 33c-1-6 5-10 10-8 3-5 12-3 12 3 5 1 6 8 1 10-1 5-9 6-12 3-5 3-12 0-11-8z" {...filled("var(--card)")} />
      <circle cx="28.5" cy="33" r="4.6" fill={a} stroke="currentColor" strokeWidth={2.2} />
    </>
  ),
  main: (a) => (
    <>
      <path d="M9 31h46c-1 12-10 21-23 21S10 43 9 31z" {...filled(a, 0.35)} />
      <path d="M8 31.5c16-1 32-1 48 0" {...stroke} />
      <path d="M22 52.5c6 1.5 14 1.5 20 0" {...stroke} />
      <path d="M17 31c2-6 6-9 11-8 3-4 9-4 12 0 4-1 8 3 8 8" {...stroke} />
      <path d="M38 22l16-14M42 25l17-12" {...stroke} />
    </>
  ),
  soup: (a) => (
    <>
      <path d="M10 26h44v16c0 7-6 12-13 12H23c-7 0-13-5-13-12V26z" {...filled(a, 0.3)} />
      <path d="M7 26.5c17-1 34-1 50 0" {...stroke} />
      <path d="M10 32c-4 0-5 4-1 5M54 32c4 0 5 4 1 5" {...stroke} />
      <path d="M22 19c-3-3 3-5 0-9M32 19c-3-3 3-5 0-9M42 19c-3-3 3-5 0-9" {...stroke} />
    </>
  ),
  salad: (a) => (
    <>
      <path d="M17 30c-2-8 4-14 10-12-1-6 8-9 11-3 6-3 12 3 9 9 5 1 6 6 3 7" {...filled(a, 0.45)} />
      <path d="M27 18c2 4 3 8 2 12M38 15c-1 5-1 10 1 15" {...stroke} />
      <path d="M8 31h48c-1 12-10 21-24 21S9 43 8 31z" {...filled("var(--card)")} />
      <circle cx="20" cy="40" r="2" fill="currentColor" />
      <circle cx="44" cy="41" r="2" fill="currentColor" />
    </>
  ),
  appetizer: (a) => (
    <>
      <path d="M10 46L30 10l22 36c-14 3-28 3-42 0z" {...filled(a, 0.4)} />
      <circle cx="27" cy="30" r="2.2" fill="currentColor" />
      <circle cx="35" cy="38" r="2.2" fill="currentColor" />
      <circle cx="22" cy="40" r="2" fill="currentColor" />
      <path d="M14 54c10 2 26 2 38 0" {...stroke} />
    </>
  ),
  side: (a) => (
    <>
      <path d="M14 37c-4-12 6-23 19-24 13-1 21 8 19 19-2 12-12 20-24 19-8-1-12-6-14-14z" {...filled(a, 0.35)} />
      <path d="M24 28l1 1M36 24l1 1M40 38l1 1M28 41l1 1" {...stroke} strokeWidth={3.2} />
    </>
  ),
  drink: (a) => (
    <>
      <path d="M18 18h28l-4 34c0 2-2 3-4 3H26c-2 0-4-1-4-3l-4-34z" {...filled(a, 0.3)} />
      <path d="M20 30c8 2 16 2 24 0" {...stroke} />
      <path d="M36 50L40 6l9-1" {...stroke} />
      <circle cx="26" cy="39" r="2" {...stroke} strokeWidth={2} />
      <circle cx="33" cy="44" r="1.6" {...stroke} strokeWidth={2} />
    </>
  ),
  dessert: (a) => (
    <>
      <path d="M16 34l4 20h24l4-20" {...filled("var(--card)")} />
      <path d="M25 36l1 17M32 36v17M39 36l-1 17" {...stroke} strokeWidth={2} />
      <path d="M13 34c-3-7 3-12 8-11 0-7 8-11 13-7 6-3 12 2 11 8 5 0 8 6 4 10-12 2-25 2-36 0z" {...filled(a, 0.45)} />
      <circle cx="33" cy="12" r="3.4" fill="var(--tomato)" stroke="currentColor" strokeWidth={2} />
    </>
  ),
};

export function CourseDoodle({ course, size = 64, className }: { course: Course; size?: number; className?: string }) {
  return (
    <svg viewBox="0 0 64 64" width={size} height={size} className={className} aria-hidden="true">
      {COURSE_ART[course](COURSE_ACCENT[course])}
    </svg>
  );
}

/** The Pantry Pal mascot: a smiling jar. */
export function JarLogo({ size = 48, className }: { size?: number; className?: string }) {
  return (
    <svg viewBox="0 0 64 64" width={size} height={size} className={className} aria-hidden="true">
      <path d="M17 10c10-1.5 20-1.5 30 0l-1 8H18z" {...filled("var(--tomato)")} />
      <path d="M19 18c-5 4-7 9-7 16v14c0 7 5 11 12 11h16c7 0 12-4 12-11V34c0-7-2-12-7-16z" {...filled("var(--card)")} />
      <path d="M16 36c10 3 22 3 32 0v12c-10 3-22 3-32 0z" fill="var(--mustard)" fillOpacity={0.55} stroke="none" />
      <circle cx="26" cy="32" r="2.2" fill="currentColor" />
      <circle cx="38" cy="32" r="2.2" fill="currentColor" />
      <path d="M27 39c3 3 7 3 10 0" {...stroke} strokeWidth={2.2} />
      <path d="M20 37c1.5 0.5 3 0.5 4 0M40 37c1.5 0.5 3 0.5 4 0" stroke="var(--tomato)" strokeWidth={2.4} strokeLinecap="round" />
      <path d="M45 24c2 3 2 7 1 10" {...stroke} strokeWidth={2} opacity={0.5} />
    </svg>
  );
}

const TOOL_ART: Record<Equipment, React.ReactNode> = {
  "no-cook": (
    <>
      <path d="M8 22c-2-8 4-14 12-13 6 1 9 7 6 13-3 5-12 6-18 0z" {...stroke} />
      <path d="M8 22c5-3 10-6 15-11" {...stroke} />
    </>
  ),
  microwave: (
    <>
      <rect x="3" y="7" width="26" height="18" rx="3" {...stroke} />
      <rect x="7" y="11" width="13" height="10" rx="2" {...stroke} />
      <path d="M24 12v1M24 17v1M24 21v.5" {...stroke} />
    </>
  ),
  stovetop: (
    <>
      <path d="M4 17c0-5 5-8 11-8s11 3 11 8-5 7-11 7-11-2-11-7z" {...stroke} />
      <path d="M26 15c2 0 4 1 5 2" {...stroke} strokeWidth={3.4} />
      <path d="M10 29c1-2-1-3 0-5M15 29c1-2-1-3 0-5M20 29c1-2-1-3 0-5" {...stroke} strokeWidth={2} />
    </>
  ),
  blender: (
    <>
      <path d="M9 4h14l-2 16H11z" {...stroke} />
      <path d="M8 20h16l1 8H7z" {...stroke} />
      <path d="M12 12l8-2" {...stroke} />
    </>
  ),
  toaster: (
    <>
      <path d="M5 14c0-3 2-5 5-5h12c3 0 5 2 5 5v11H5z" {...stroke} />
      <path d="M11 9V5h4v4M17 9V5h4v4" {...stroke} />
      <path d="M27 18h2" {...stroke} />
    </>
  ),
  "air-fryer": (
    <>
      <path d="M7 6h18c2 0 3 1 3 3v17c0 2-1 3-3 3H7c-2 0-3-1-3-3V9c0-2 1-3 3-3z" {...stroke} />
      <path d="M8 17h16v8H8z" {...stroke} />
      <circle cx="16" cy="11" r="2" {...stroke} strokeWidth={2} />
    </>
  ),
};

export function ToolIcon({ tool, size = 22 }: { tool: Equipment; size?: number }) {
  return (
    <svg viewBox="0 0 32 32" width={size} height={size} aria-hidden="true">
      {TOOL_ART[tool]}
    </svg>
  );
}

export function HeartIcon({ filled, size = 24 }: { filled: boolean; size?: number }) {
  return (
    <svg viewBox="0 0 32 32" width={size} height={size} aria-hidden="true">
      <path
        d="M16 27C9 22 4 17 4 11.5 4 8 6.5 5 10 5c2.5 0 4.5 1.5 6 4 1.5-2.5 3.5-4 6-4 3.5 0 6 3 6 6.5C28 17 23 22 16 27z"
        {...stroke}
        fill={filled ? "var(--tomato)" : "none"}
      />
    </svg>
  );
}

/** A loose, hand-drawn squiggle used as a section divider. */
export function Squiggle({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 12" className={className} preserveAspectRatio="none" aria-hidden="true">
      <path d="M2 7c12-6 20 6 32 0s20 6 32 0 20 6 32 0 20 6 32 0 20 6 32 0 20 6 32 0" {...stroke} strokeWidth={2.2} />
    </svg>
  );
}
