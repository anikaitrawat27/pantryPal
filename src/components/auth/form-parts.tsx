"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useId, type ReactNode } from "react";
import { ApiClientError } from "@/client/api";
import { useLang } from "@/i18n/client";
import { localePath } from "@/i18n/config";
import type { Dict } from "@/i18n/dict";
import { safeNext, type CredentialProblem } from "@/lib/account-rules";
import ui from "../ui.module.css";
import styles from "./auth.module.css";

/** Pieces shared by the sign-in, sign-up, reset, and account forms. */

export type T = Dict["auth"];
export type Errors = Partial<Record<"username" | "password" | "code" | "form", string>>;

const PROBLEM_FIELD: Record<CredentialProblem, "username" | "password"> = {
  username: "username",
  password: "password",
  same: "password",
};

export function problemMessages(problems: CredentialProblem[], t: T): Errors {
  const msg: Record<CredentialProblem, string> = { username: t.errUsername, password: t.errPassword, same: t.errSame };
  return Object.fromEntries(problems.map((p) => [PROBLEM_FIELD[p], msg[p]]));
}

/** Maps API failures to localized messages. Server messages are English, so the status decides the text. */
export function apiErrors(err: unknown, t: T, on401: string): Errors {
  if (!(err instanceof ApiClientError)) return { form: t.errGeneric };
  if (err.status === 401) return { form: on401 };
  if (err.status === 409) return { username: t.errTaken };
  if (err.status === 429) return { form: t.errTooMany };
  if (err.status === 400 && err.body?.error.fields) {
    const f = err.body.error.fields;
    return {
      ...(f.username ? { username: t.errUsername } : {}),
      ...(f.password || f.newPassword ? { password: t.errPassword } : {}),
    };
  }
  return { form: t.errGeneric };
}

export function Field({
  label,
  error,
  hint,
  ...input
}: { label: string; error?: string; hint?: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  const id = useId();
  const describedBy = [hint && `${id}-hint`, error && `${id}-error`].filter(Boolean).join(" ") || undefined;
  return (
    <div className={styles.field}>
      <label htmlFor={id}>{label}</label>
      <input id={id} aria-invalid={Boolean(error)} aria-describedby={describedBy} {...input} />
      {hint && (
        <small id={`${id}-hint`} className={styles.hint}>
          {hint}
        </small>
      )}
      {error && (
        <small id={`${id}-error`} className={styles.error}>
          {error}
        </small>
      )}
    </div>
  );
}

export function FormShell({ title, intro, children }: { title: string; intro?: string; children: ReactNode }) {
  return (
    <div className={`${ui.card} ${styles.shell}`}>
      <h1>{title}</h1>
      {intro && <p className={styles.intro}>{intro}</p>}
      {children}
    </div>
  );
}

export function useAfterAuth() {
  const router = useRouter();
  const lang = useLang();
  const params = useSearchParams();
  return () => router.push(safeNext(params.get("next"), localePath(lang, "/recipes")));
}
