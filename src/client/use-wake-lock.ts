"use client";

import { useEffect, useState } from "react";

export type WakeLockState = "on" | "unsupported" | "denied";

/**
 * Keeps the screen awake while `active`. Browsers drop the lock when the tab is
 * hidden, so it is requested again when the tab becomes visible.
 */
export function useWakeLock(active: boolean): WakeLockState {
  const [state, setState] = useState<WakeLockState>("on");

  useEffect(() => {
    if (!active) return;
    if (!("wakeLock" in navigator)) {
      setState("unsupported");
      return;
    }
    let sentinel: WakeLockSentinel | null = null;
    let cancelled = false;

    const request = async () => {
      try {
        const s = await navigator.wakeLock.request("screen");
        if (cancelled) {
          void s.release();
          return;
        }
        sentinel = s;
        setState("on");
      } catch {
        setState("denied");
      }
    };
    const onVisible = () => {
      if (document.visibilityState === "visible") void request();
    };

    void request();
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      cancelled = true;
      document.removeEventListener("visibilitychange", onVisible);
      void sentinel?.release();
    };
  }, [active]);

  return state;
}
