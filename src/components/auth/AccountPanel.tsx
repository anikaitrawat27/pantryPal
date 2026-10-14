"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { deleteAccount, logOut, regenerateRecoveryCodes, useAccount } from "@/client/account";
import { useDict, useLang } from "@/i18n/client";
import { localePath } from "@/i18n/config";
import ui from "../ui.module.css";
import styles from "./auth.module.css";
import { apiErrors, Field, FormShell } from "./form-parts";
import { RecoveryCodes } from "./RecoveryCodes";

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
