/** A cooking time found in a step, such as "8 to 10 minutes". */
export interface StepTimer {
  /** The text as written, for the button label. */
  label: string;
  /** Timer length. For a range this is the low end, so the cook checks early. */
  seconds: number;
}

const WORDS: Record<string, number> = {
  a: 1,
  an: 1,
  one: 1,
  two: 2,
  three: 3,
  four: 4,
  five: 5,
  six: 6,
  seven: 7,
  eight: 8,
  nine: 9,
  ten: 10,
  fifteen: 15,
  twenty: 20,
  thirty: 30,
};

const UNIT_SECONDS: Record<string, number> = { s: 1, m: 60, h: 3600 };

const NUM = String.raw`(\d+(?:\.\d+)?(?:\s+1\/2)?|\d+\/\d+|${Object.keys(WORDS).join("|")})`;
const PATTERN = new RegExp(
  String.raw`\b${NUM}(?:\s*(?:to|-|–|or)\s*${NUM})?(\s+and a half)?\s*(seconds?|secs?|minutes?|mins?|hours?|hrs?)\b`,
  "gi",
);

function toNumber(raw: string): number {
  const s = raw.toLowerCase().trim();
  if (s in WORDS) return WORDS[s];
  const [whole, frac] = s.split(/\s+/);
  const parse = (x: string) => (x.includes("/") ? Number(x.split("/")[0]) / Number(x.split("/")[1]) : Number(x));
  return parse(whole) + (frac ? parse(frac) : 0);
}

/** Finds every cooking time in a step. Times over 4 hours (such as "overnight" chilling) are ignored. */
export function parseTimers(step: string): StepTimer[] {
  const out: StepTimer[] = [];
  for (const m of step.matchAll(PATTERN)) {
    const [label, low, , half, unit] = m;
    const seconds = Math.round((toNumber(low) + (half ? 0.5 : 0)) * UNIT_SECONDS[unit[0].toLowerCase()]);
    if (seconds > 0 && seconds <= 4 * 3600) out.push({ label: label.trim(), seconds });
  }
  return out;
}

/** 75 -> "1:15", 3725 -> "1:02:05". */
export function formatClock(totalSeconds: number): string {
  const s = Math.max(0, Math.ceil(totalSeconds));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = String(s % 60).padStart(2, "0");
  return h ? `${h}:${String(m).padStart(2, "0")}:${sec}` : `${m}:${sec}`;
}
