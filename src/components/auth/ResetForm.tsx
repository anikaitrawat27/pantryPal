"use client";

import { useState, type FormEvent } from "react";
import { resetPassword } from "@/client/account";
import { useDict } from "@/i18n/client";
import { PASSWORD_MAX, PASSWORD_MIN } from "@/lib/account-rules";
import ui from "../ui.module.css";
import styles from "./auth.module.css";
import { apiErrors, Field, FormShell, useAfterAuth, type Errors } from "./form-parts";

export function ResetForm() {
  const t = useDict().auth;
  const done = useAfterAuth();
  const [busy, setBusy] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const [left, setLeft] = useState<number | null>(null);

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const username = String(form.get("username"));
    const newPassword = String(form.get("password"));
    if (newPassword.length < PASSWORD_MIN || newPassword.length > PASSWORD_MAX)
      return setErrors({ password: t.errPassword });
    setBusy(true);
    setErrors({});
    try {
      setLeft(await resetPassword(username, String(form.get("code")), newPassword));
    } catch (err) {
      setErrors(apiErrors(err, t, t.errBadReset));
      setBusy(false);
    }
  };

  if (left !== null) {
    return (
      <FormShell title={t.resetTitle}>
        <p role="status">{t.resetDone(left)}</p>
        <button type="button" className={`${ui.button} ${ui.primary}`} onClick={done}>
          {t.continue}
        </button>
      </FormShell>
    );
  }

  return (
    <FormShell title={t.resetTitle} intro={t.resetBody}>
      <form onSubmit={submit} className={styles.form} noValidate>
        <Field
          label={t.username}
          name="username"
          autoComplete="username"
          autoCapitalize="none"
          required
          error={errors.username}
        />
        <Field
          label={t.recoveryCode}
          name="code"
          autoComplete="one-time-code"
          autoCapitalize="none"
          required
          error={errors.code}
        />
        <Field
          label={t.newPassword}
          name="password"
          type="password"
          autoComplete="new-password"
          hint={t.passwordHint}
          required
          error={errors.password}
        />
        {errors.form && (
          <p className={styles.formError} role="alert">
            {errors.form}
          </p>
        )}
        <button type="submit" className={`${ui.button} ${ui.primary}`} disabled={busy}>
          {busy ? t.working : t.resetTitle}
        </button>
      </form>
    </FormShell>
  );
}
