"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { logIn } from "@/client/account";
import { useDict, useLang } from "@/i18n/client";
import { localePath } from "@/i18n/config";
import ui from "../ui.module.css";
import styles from "./auth.module.css";
import { apiErrors, Field, FormShell, useAfterAuth, type Errors } from "./form-parts";

export function LoginForm() {
  const t = useDict().auth;
  const lang = useLang();
  const done = useAfterAuth();
  const [busy, setBusy] = useState(false);
  const [errors, setErrors] = useState<Errors>({});

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setBusy(true);
    setErrors({});
    try {
      await logIn(String(form.get("username")), String(form.get("password")));
      done();
    } catch (err) {
      setErrors(apiErrors(err, t, t.errBadLogin));
      setBusy(false);
    }
  };

  return (
    <FormShell title={t.signIn} intro={t.whySignIn}>
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
          label={t.password}
          name="password"
          type="password"
          autoComplete="current-password"
          required
          error={errors.password}
        />
        {errors.form && (
          <p className={styles.formError} role="alert">
            {errors.form}
          </p>
        )}
        <button type="submit" className={`${ui.button} ${ui.primary}`} disabled={busy}>
          {busy ? t.working : t.signIn}
        </button>
      </form>
      <p className={styles.links}>
        <Link href={localePath(lang, "/reset")}>{t.forgot}</Link>
        <span>
          {t.noAccount} <Link href={localePath(lang, "/signup")}>{t.signUp}</Link>
        </span>
      </p>
    </FormShell>
  );
}
