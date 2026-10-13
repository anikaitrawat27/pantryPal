"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { getIngredient } from "@/data/pantry";
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
      aria-label={`Cooking ${title}`}
      tabIndex={-1}
    >
      <header className={styles.top}>
        <div>
          <p className={styles.title}>{title}</p>
          <p className={styles.wake}>
            {wake === "on" ? "Screen stays on while cooking" : "Your screen may turn off; tap it now and then"}
          </p>
        </div>
        <div className={styles.topActions}>
          <button
            type="button"
            className={styles.ghost}
            aria-expanded={showIngredients}
            onClick={() => setShowIngredients((s) => !s)}
          >
            Ingredients
          </button>
          <button type="button" className={styles.ghost} onClick={onClose}>
            Exit
          </button>
        </div>
      </header>

      <div className={styles.progress} aria-hidden="true">
        <span style={{ width: `${(Math.min(step + 1, steps.length) / steps.length) * 100}%` }} />
      </div>

      {timers.length > 0 && (
        <ul className={styles.timers} aria-label="Timers">
          {timers.map((t) => (
            <li key={t.key} className={styles.timer} data-done={t.done}>
              <span className={styles.clock} role={t.done ? "alert" : undefined}>
                {t.done ? "Time's up" : formatClock((t.endsAt - now) / 1000)}
              </span>
              <span className={styles.timerLabel}>
                Step {t.step + 1} · {t.label}
              </span>
              <button
                type="button"
                onClick={() => dismiss(t.key)}
                aria-label={t.done ? "Dismiss timer" : `Cancel ${t.label} timer`}
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
              Step {step + 1} of {steps.length}
            </p>
            <p className={styles.step} aria-live="polite">
              {steps[step]}
            </p>
            <div className={styles.timerButtons}>
              {parseTimers(steps[step]).map((t) => {
                const isRunning = timers.some((x) => x.step === step && x.label === t.label && !x.done);
                return (
                  <button
                    key={t.label}
                    type="button"
                    className={styles.startTimer}
                    disabled={isRunning}
                    onClick={() => startTimer(t.label, t.seconds)}
                  >
                    {isRunning ? "Timer running" : `Start timer: ${formatClock(t.seconds)}`}
                    {!isRunning && /\d+\s*(to|-|–|or)\s*\d+/.test(t.label) && (
                      <small> (checks at the low end of {t.label})</small>
                    )}
                  </button>
                );
              })}
            </div>
          </>
        )}
      </div>

      <nav className={styles.nav} aria-label="Steps">
        <button type="button" onClick={() => go(-1)} disabled={step === 0}>
          ← Back
        </button>
        <button type="button" className={styles.next} onClick={() => go(1)} disabled={finished}>
          {step === steps.length - 1 ? "Finish" : "Next →"}
        </button>
      </nav>
    </div>
  );
}

/** End screen: lets the cook flag pantry items that are now running low. */
function Finished({ ingredientIds, onClose }: { ingredientIds: readonly string[]; onClose: () => void }) {
  const { pantry, markLow } = useMyPantry();
  const owned = ingredientIds
    .filter((id) => pantry.have.some((h) => related(id, h)))
    .map((id) => pantry.have.find((h) => related(id, h))!);
  const unique = [...new Set(owned)];
  const [low, setLow] = useState<ReadonlySet<string>>(new Set());
  const [saved, setSaved] = useState(false);

  return (
    <div className={styles.finished}>
      <p className={styles.step}>All done. Enjoy.</p>
      {unique.length > 0 && !saved && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            markLow([...low], true);
            setSaved(true);
          }}
        >
          <fieldset>
            <legend>Running low on anything?</legend>
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
                {getIngredient(id).name}
              </label>
            ))}
          </fieldset>
          <button type="submit" className={styles.startTimer} disabled={low.size === 0}>
            Add to my shopping list
          </button>
        </form>
      )}
      {saved && <p role="status">Marked as running low. They will show on your shopping list.</p>}
      <button type="button" className={styles.next} onClick={onClose}>
        Back to recipe
      </button>
    </div>
  );
}
