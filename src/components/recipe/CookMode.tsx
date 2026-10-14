"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useCookTimers } from "@/client/use-cook-timers";
import { useWakeLock } from "@/client/use-wake-lock";
import { useDict } from "@/i18n/client";
import { formatClock, parseTimers } from "@/lib/timers";
import styles from "./CookMode.module.css";
import { CookModeFinished } from "./CookModeFinished";

interface Props {
  title: string;
  steps: readonly string[];
  /** Ingredient lines as currently scaled and swapped. */
  ingredientLines: readonly { id: string; line: string }[];
  onClose: () => void;
}

/** A timer label that is a range, like "8 to 10 minutes", starts at the low end. */
const isRange = (label: string) => /\d+\s*(to|-|–|or|a|o)\s*\d+/.test(label);

/**
 * Full-screen, one-step-at-a-time view for cooking. Arrow keys move between steps,
 * Escape exits, timers keep running across steps, and the screen stays awake where supported.
 */
export function CookMode({ title, steps, ingredientLines, onClose }: Props) {
  const t = useDict().cook;
  const [step, setStep] = useState(0);
  const [showIngredients, setShowIngredients] = useState(false);
  const timers = useCookTimers();
  const wake = useWakeLock(true);
  const dialog = useRef<HTMLDivElement>(null);
  /** One past the last step is the "All done" screen. */
  const finished = step === steps.length;

  const go = useCallback(
    (delta: number) => setStep((s) => Math.min(steps.length, Math.max(0, s + delta))),
    [steps.length],
  );

  // Take over the screen: focus the dialog and stop the page behind it from scrolling.
  useEffect(() => {
    dialog.current?.focus();
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
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
          <p className={styles.wake}>{wake === "on" ? t.wakeOn : t.wakeOff}</p>
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

      {timers.timers.length > 0 && (
        <ul className={styles.timers} aria-label={t.timers}>
          {timers.timers.map((timer) => (
            <li key={timer.key} className={styles.timer} data-done={timer.done}>
              <span className={styles.clock} role={timer.done ? "alert" : undefined}>
                {timer.done ? t.timesUp : formatClock(timers.secondsLeft(timer))}
              </span>
              <span className={styles.timerLabel}>
                {t.stepShort(timer.step + 1)} · {timer.label}
              </span>
              <button
                type="button"
                onClick={() => timers.dismiss(timer.key)}
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
          <CookModeFinished ingredientIds={ingredientLines.map((i) => i.id)} onClose={onClose} />
        ) : (
          <>
            <p className={styles.counter}>{t.stepOf(step + 1, steps.length)}</p>
            <p className={styles.step} aria-live="polite">
              {steps[step]}
            </p>
            <div className={styles.timerButtons}>
              {parseTimers(steps[step]).map((found) => {
                const running = timers.isRunning(step, found.label);
                return (
                  <button
                    key={found.label}
                    type="button"
                    className={styles.startTimer}
                    disabled={running}
                    onClick={() => timers.start(step, found.label, found.seconds)}
                  >
                    {running ? t.running : t.start(formatClock(found.seconds))}
                    {!running && isRange(found.label) && <small>{t.lowEnd(found.label)}</small>}
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
