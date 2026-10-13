"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useDict, useLang } from "@/i18n/client";
import { ingredientName } from "@/i18n/ingredients";
import { playAlarm, unlockAudio } from "@/lib/alarm";
import { related } from "@/lib/match";
import { useMyPantry } from "@/lib/my-pantry";
import { formatClock, parseTimers } from "@/lib/timers";
import { useWakeLock } from "@/lib/use-wake-lock";
import styles from "./CookMode.module.css";

interface Props {
  title: string;
  steps: readonly string[];
  /** Ingredient lines as currently scaled and swapped. */
  ingredientLines: readonly { id: string; line: string }[];
  onClose: () => void;
}

interface RunningTimer {
  key: string;
  label: string;
  step: number;
  endsAt: number;
  done: boolean;
}

/**
 * Full-screen, one-step-at-a-time view for cooking. Timers keep running while
 * the cook moves between steps, and the screen stays awake where supported.
 */
export function CookMode({ title, steps, ingredientLines, onClose }: Props) {
  const t = useDict().cook;
  const [step, setStep] = useState(0);
  const [showIngredients, setShowIngredients] = useState(false);
  const [timers, setTimers] = useState<RunningTimer[]>([]);
  const [now, setNow] = useState(() => Date.now());
  const wake = useWakeLock(true);
  const dialog = useRef<HTMLDivElement>(null);
  const finished = step === steps.length;

  const go = useCallback(
    (delta: number) => setStep((s) => Math.min(steps.length, Math.max(0, s + delta))),
    [steps.length],
  );

  useEffect(() => {
    dialog.current?.focus();
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowRight") go(1);
      else if (e.key === "ArrowLeft") go(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go, onClose]);

  // Tick once a second while any timer is running, and ring when one finishes.
  const running = timers.some((t) => !t.done);
  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => {
      const t = Date.now();
      setNow(t);
      setTimers((prev) => {
        if (!prev.some((x) => !x.done && x.endsAt <= t)) return prev;
        playAlarm();
        return prev.map((x) => (!x.done && x.endsAt <= t ? { ...x, done: true } : x));
      });
    }, 1000);
    return () => clearInterval(id);
  }, [running]);

  const startTimer = (label: string, seconds: number) => {
    unlockAudio();
    const t = Date.now();
    setNow(t);
    setTimers((prev) => [
      ...prev,
      { key: `${step}-${label}-${t}`, label, step, endsAt: t + seconds * 1000, done: false },
    ]);
  };

  const dismiss = (key: string) => setTimers((prev) => prev.filter((t) => t.key !== key));

  return (
    <div
      ref={dialog}
      className={styles.overlay}
      role="dialog"
      aria-modal="true"
      aria-label={t.dialog(title)}
      tabIndex={-1}
    >
      <header className={styles.top}>
        <div>
          <p className={styles.title}>{title}</p>
          <p className={styles.wake}>
            {wake === "on" ? t.wakeOn : t.wakeOff}
          </p>
        </div>
        <div className={styles.topActions}>
          <button
            type="button"
            className={styles.ghost}
            aria-expanded={showIngredients}
            onClick={() => setShowIngredients((s) => !s)}
          >
            {t.ingredients}
          </button>
          <button type="button" className={styles.ghost} onClick={onClose}>
            {t.exit}
          </button>
        </div>
      </header>

      <div className={styles.progress} aria-hidden="true">
        <span style={{ width: `${(Math.min(step + 1, steps.length) / steps.length) * 100}%` }} />
      </div>

      {timers.length > 0 && (
        <ul className={styles.timers} aria-label={t.timers}>
          {timers.map((timer) => (
            <li key={timer.key} className={styles.timer} data-done={timer.done}>
              <span className={styles.clock} role={timer.done ? "alert" : undefined}>
                {timer.done ? t.timesUp : formatClock((timer.endsAt - now) / 1000)}
              </span>
              <span className={styles.timerLabel}>
                {t.stepShort(timer.step + 1)} · {timer.label}
              </span>
              <button
                type="button"
                onClick={() => dismiss(timer.key)}
                aria-label={timer.done ? t.dismiss : t.cancel(timer.label)}
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      )}

      {showIngredients && (
        <ul className={styles.ingredients}>
          {ingredientLines.map((i) => (
            <li key={i.id}>{i.line}</li>
          ))}
        </ul>
      )}

      <div className={styles.stage}>
        {finished ? (
          <Finished ingredientIds={ingredientLines.map((i) => i.id)} onClose={onClose} />
        ) : (
          <>
            <p className={styles.counter}>
              {t.stepOf(step + 1, steps.length)}
            </p>
            <p className={styles.step} aria-live="polite">
              {steps[step]}
            </p>
            <div className={styles.timerButtons}>
              {parseTimers(steps[step]).map((found) => {
                const isRunning = timers.some((x) => x.step === step && x.label === found.label && !x.done);
                return (
                  <button
                    key={found.label}
                    type="button"
                    className={styles.startTimer}
                    disabled={isRunning}
                    onClick={() => startTimer(found.label, found.seconds)}
                  >
                    {isRunning ? t.running : t.start(formatClock(found.seconds))}
                    {!isRunning && /\d+\s*(to|-|–|or|a|o)\s*\d+/.test(found.label) && <small>{t.lowEnd(found.label)}</small>}
                  </button>
                );
              })}
            </div>
          </>
        )}
      </div>

      <nav className={styles.nav} aria-label={t.stepsNav}>
        <button type="button" onClick={() => go(-1)} disabled={step === 0}>
          {t.back}
        </button>
        <button type="button" className={styles.next} onClick={() => go(1)} disabled={finished}>
          {step === steps.length - 1 ? t.finish : t.next}
        </button>
      </nav>
    </div>
  );
}

/** End screen: lets the cook flag pantry items that are now running low. */
function Finished({ ingredientIds, onClose }: { ingredientIds: readonly string[]; onClose: () => void }) {
  const t = useDict().cook;
  const lang = useLang();
  const { pantry, markLow } = useMyPantry();
  const owned = ingredientIds
    .filter((id) => pantry.have.some((h) => related(id, h)))
    .map((id) => pantry.have.find((h) => related(id, h))!);
  const unique = [...new Set(owned)];
  const [low, setLow] = useState<ReadonlySet<string>>(new Set());
  const [saved, setSaved] = useState(false);

  return (
    <div className={styles.finished}>
      <p className={styles.step}>{t.done}</p>
      {unique.length > 0 && !saved && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            markLow([...low], true);
            setSaved(true);
          }}
        >
          <fieldset>
            <legend>{t.lowQuestion}</legend>
            {unique.map((id) => (
              <label key={id}>
                <input
                  type="checkbox"
                  checked={low.has(id)}
                  onChange={() =>
                    setLow((prev) => {
                      const next = new Set(prev);
                      if (next.has(id)) next.delete(id);
                      else next.add(id);
                      return next;
                    })
                  }
                />
                {ingredientName(id, lang)}
              </label>
            ))}
          </fieldset>
          <button type="submit" className={styles.startTimer} disabled={low.size === 0}>
            {t.lowSubmit}
          </button>
        </form>
      )}
      {saved && <p role="status">{t.lowSaved}</p>}
      <button type="button" className={styles.next} onClick={onClose}>
        {t.backToRecipe}
      </button>
    </div>
  );
}
