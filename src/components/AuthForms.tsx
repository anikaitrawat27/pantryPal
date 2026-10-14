"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useId, useState, type FormEvent, type ReactNode } from "react";
import { useDict, useLang } from "@/i18n/client";
import { localePath } from "@/i18n/config";
import type { Dict } from "@/i18n/dict";
import {
  deleteAccount,
  logIn,
  logOut,
  regenerateRecoveryCodes,
  resetPassword,
  signUp,
  useAccount,
} from "@/client/account";
import { checkCredentials, PASSWORD_MAX, PASSWORD_MIN, safeNext, type CredentialProblem } from "@/lib/account-rules";
import { ApiClientError } from "@/client/api";
import styles from "./AuthForms.module.css";
import ui from "./ui.module.css";

type T = Dict["auth"];
type Errors = Partial<Record<"username" | "password" | "code" | "form", string>>;

const PROBLEM_FIELD: Record<CredentialProblem, "username" | "password"> = {
  username: "username",
  password: "password",
  same: "password",
};

function problemMessages(problems: CredentialProblem[], t: T): Errors {
  const msg: Record<CredentialProblem, string> = { username: t.errUsername, password: t.errPassword, same: t.errSame };
  return Object.fromEntries(problems.map((p) => [PROBLEM_FIELD[p], msg[p]]));
}

/** Maps API failures to localized messages. Server messages are English, so the status decides the text. */
function apiErrors(err: unknown, t: T, on401: string): Errors {
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

function Field({
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

function FormShell({ title, intro, children }: { title: string; intro?: string; children: ReactNode }) {
  return (
    <div className={`${ui.card} ${styles.shell}`}>
      <h1>{title}</h1>
      {intro && <p className={styles.intro}>{intro}</p>}
      {children}
    </div>
  );
}

function useAfterAuth() {
  const router = useRouter();
  const lang = useLang();
  const params = useSearchParams();
  return () => router.push(safeNext(params.get("next"), localePath(lang, "/pantry")));
}

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

/** Shows recovery codes once, with copy and download, and waits for the user to confirm they saved them. */
export function RecoveryCodes({ codes, onDone }: { codes: string[]; onDone: () => void }) {
  const t = useDict().auth;
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(false);
  const text = codes.join("\n");
  const download = () => {
    const url = URL.createObjectURL(new Blob([`Pantry Pal recovery codes\n\n${text}\n`], { type: "text/plain" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = "pantry-pal-recovery-codes.txt";
    a.click();
    URL.revokeObjectURL(url);
  };
  return (
    <div className={styles.codes}>
      <h2>{t.codesTitle}</h2>
      <p>{t.codesBody}</p>
      <ol className={styles.codeList} data-testid="recovery-codes">
        {codes.map((c) => (
          <li key={c}>
            <code>{c}</code>
          </li>
        ))}
      </ol>
      <div className={styles.row}>
        <button
          type="button"
          className={ui.button}
          onClick={() =>
            navigator.clipboard
              .writeText(text)
              .then(() => setCopied(true))
              .catch(() => setCopied(false))
          }
        >
          {copied ? "✓" : t.codesCopy}
        </button>
        <button type="button" className={ui.button} onClick={download}>
          {t.codesDownload}
        </button>
      </div>
      <label className={styles.check}>
        <input type="checkbox" checked={saved} onChange={(e) => setSaved(e.target.checked)} />
        {t.codesSaved}
      </label>
      <button type="button" className={`${ui.button} ${ui.primary}`} disabled={!saved} onClick={onDone}>
        {t.continue}
      </button>
    </div>
  );
}

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

/** Asks for the password before a sensitive action, then runs it. */
function ConfirmWithPassword({
  label,
  body,
  danger,
  onConfirm,
}: {
  label: string;
  body: string;
  danger?: boolean;
  onConfirm: (password: string) => Promise<void>;
}) {
  const t = useDict().auth;
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string>();

  if (!open) {
    return (
      <button type="button" className={`${ui.button} ${danger ? styles.danger : ""}`} onClick={() => setOpen(true)}>
        {label}
      </button>
    );
  }
  return (
    <form
      className={styles.confirm}
      onSubmit={async (e) => {
        e.preventDefault();
        setBusy(true);
        setError(undefined);
        try {
          await onConfirm(String(new FormData(e.currentTarget).get("password")));
          setOpen(false);
        } catch (err) {
          setError(apiErrors(err, t, t.errBadPassword).form ?? t.errGeneric);
        } finally {
          setBusy(false);
        }
      }}
    >
      <p>{body}</p>
      <Field
        label={t.password}
        name="password"
        type="password"
        autoComplete="current-password"
        required
        error={error}
      />
      <div className={styles.row}>
        <button type="submit" className={`${ui.button} ${danger ? styles.danger : ui.primary}`} disabled={busy}>
          {busy ? t.working : label}
        </button>
        <button type="button" className={styles.linkBtn} onClick={() => setOpen(false)}>
          {t.cancel}
        </button>
      </div>
    </form>
  );
}

export function AccountPanel() {
  const d = useDict();
  const t = d.auth;
  const lang = useLang();
  const router = useRouter();
  const account = useAccount();
  const [newCodes, setNewCodes] = useState<string[] | null>(null);

  if (account.status === "loading") return <p className="hand">{t.working}</p>;
  if (account.status === "guest") {
    return (
      <FormShell title={t.accountTitle} intro={t.whySignIn}>
        <div className={styles.row}>
          <Link href={localePath(lang, "/login")} className={`${ui.button} ${ui.primary}`}>
            {t.signIn}
          </Link>
          <Link href={localePath(lang, "/signup")} className={ui.button}>
            {t.signUp}
          </Link>
        </div>
      </FormShell>
    );
  }

  if (newCodes) {
    return (
      <FormShell title={t.accountTitle}>
        <RecoveryCodes codes={newCodes} onDone={() => setNewCodes(null)} />
      </FormShell>
    );
  }

  return (
    <FormShell title={t.accountTitle}>
      <p className={styles.who}>{t.signedInAs(account.username)}</p>
      <p>{t.syncNote}</p>
      <p>
        <Link href={localePath(lang, "/my-recipes")}>{d.nav.myRecipes}</Link>
      </p>
      <p>
        {t.codesLeft(account.recoveryCodesLeft)} {account.recoveryCodesLeft <= 2 && <strong>{t.codesLow}</strong>}
      </p>
      <div className={styles.actions}>
        <ConfirmWithPassword
          label={t.regenerate}
          body={t.regenerateBody}
          onConfirm={async (pw) => setNewCodes(await regenerateRecoveryCodes(pw))}
        />
        <button
          type="button"
          className={ui.button}
          onClick={async () => {
            await logOut();
            router.push(localePath(lang, "/"));
          }}
        >
          {t.signOut}
        </button>
      </div>
      <section className={styles.dangerZone} aria-labelledby="delete-heading">
        <h2 id="delete-heading">{t.deleteTitle}</h2>
        <ConfirmWithPassword
          label={t.deleteConfirm}
          body={t.deleteBody}
          danger
          onConfirm={async (pw) => {
            await deleteAccount(pw);
            router.push(localePath(lang, "/"));
          }}
        />
      </section>
    </FormShell>
  );
}
