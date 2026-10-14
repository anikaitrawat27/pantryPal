"use client";

import { useEffect, useState } from "react";
import { playAlarm, unlockAudio } from "./alarm";

export interface CookTimer {
  key: string;
  /** The time as written in the step, e.g. "8 to 10 minutes". */
  label: string;
  /** The step (0-based) that started it. */
  step: number;
  endsAt: number;
  done: boolean;
}

/**
 * Countdown timers for cook mode. They keep running while the cook moves between
 * steps, tick once a second while any is running, and ring when one finishes.
 */
export function useCookTimers() {
  const [timers, setTimers] = useState<CookTimer[]>([]);
  const [now, setNow] = useState(() => Date.now());
  const anyRunning = timers.some((t) => !t.done);

  useEffect(() => {
    if (!anyRunning) return;
    const id = setInterval(() => {
      const time = Date.now();
      setNow(time);
      setTimers((prev) => {
        const finishing = prev.some((t) => !t.done && t.endsAt <= time);
        if (!finishing) return prev;
        playAlarm();
        return prev.map((t) => (!t.done && t.endsAt <= time ? { ...t, done: true } : t));
      });
    }, 1000);
    return () => clearInterval(id);
  }, [anyRunning]);

  const start = (step: number, label: string, seconds: number) => {
    // Browsers only allow sound after a click, so unlock audio now for the alarm later.
    unlockAudio();
    const time = Date.now();
    setNow(time);
    setTimers((prev) => [
      ...prev,
      { key: `${step}-${label}-${time}`, label, step, endsAt: time + seconds * 1000, done: false },
    ]);
  };

  const dismiss = (key: string) => setTimers((prev) => prev.filter((t) => t.key !== key));

  const isRunning = (step: number, label: string) =>
    timers.some((t) => t.step === step && t.label === label && !t.done);

  /** Seconds left on a timer. */
  const secondsLeft = (t: CookTimer) => (t.endsAt - now) / 1000;

  return { timers, start, dismiss, isRunning, secondsLeft };
}
