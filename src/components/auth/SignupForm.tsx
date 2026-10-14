"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { signUp } from "@/client/account";
import { useDict, useLang } from "@/i18n/client";
import { localePath } from "@/i18n/config";
import { checkCredentials } from "@/lib/account-rules";
import ui from "../ui.module.css";
import styles from "./auth.module.css";
import { apiErrors, Field, FormShell, problemMessages, useAfterAuth, type Errors } from "./form-parts";
import { RecoveryCodes } from "./RecoveryCodes";

export function SignupForm() {
  const t = useDict().auth;
  const lang = useLang();
  const done = useAfterAuth();
  const [busy, setBusy] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const [codes, setCodes] = useState<string[] | null>(null);

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const username = String(form.get("username"));
    const password = String(form.get("password"));
    const problems = checkCredentials(username, password);
    if (problems.length) return setErrors(problemMessages(problems, t));
    setBusy(true);
    setErrors({});
    try {
      setCodes(await signUp(username, password));
    } catch (err) {
      setErrors(apiErrors(err, t, t.errGeneric));
      setBusy(false);
    }
  };

  if (codes) {
    return (
      <FormShell title={t.signUp}>
        <RecoveryCodes codes={codes} onDone={done} />
      </FormShell>
    );
  }

  return (
    <FormShell title={t.signUp} intro={t.whySignIn}>
      <form onSubmit={submit} className={styles.form} noValidate>
        <Field
          label={t.username}
          name="username"
          autoComplete="username"
          autoCapitalize="none"
          hint={t.usernameHint}
          required
          error={errors.username}
        />
        <Field
          label={t.password}
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
          {busy ? t.working : t.signUp}
        </button>
      </form>
      <p className={styles.links}>
        <span>
          {t.haveAccount} <Link href={localePath(lang, "/login")}>{t.signIn}</Link>
        </span>
      </p>
    </FormShell>
  );
}
