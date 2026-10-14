"use client";

let ctx: AudioContext | null = null;

/** Plays three short beeps and vibrates where supported. Silent if audio is blocked. */
export function playAlarm() {
  try {
    ctx ??= new AudioContext();
    const now = ctx.currentTime;
    for (let i = 0; i < 3; i++) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.frequency.value = 880;
      gain.gain.setValueAtTime(0.0001, now + i * 0.35);
      gain.gain.exponentialRampToValueAtTime(0.3, now + i * 0.35 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.35 + 0.25);
      osc.connect(gain).connect(ctx.destination);
      osc.start(now + i * 0.35);
      osc.stop(now + i * 0.35 + 0.3);
    }
  } catch {
    // Audio unavailable.
  }
  navigator.vibrate?.([200, 100, 200, 100, 200]);
}

/** Browsers only allow audio after a user gesture, so call this from a click. */
export function unlockAudio() {
  try {
    ctx ??= new AudioContext();
    void ctx.resume();
  } catch {
    // Audio unavailable.
  }
}
