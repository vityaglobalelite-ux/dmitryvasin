"use client";

import { useState, type FormEvent } from "react";
import {
  AccountShell,
  AccountShellSkeleton,
} from "@/components/site/account/AccountShell";
import { accountT } from "@/components/site/account/copy";
import { useAccountGate } from "@/components/site/account/use-account-gate";
import { Button } from "@/components/site/ui/Button";
import { useLocale, useLocalizedRoutes } from "@/lib/catalog/locale-context";
import { updatePassword } from "@/lib/supabase/auth";
import Link from "next/link";

export function AccountProfileView() {
  const gate = useAccountGate();
  const copy = accountT(useLocale());
  const routes = useLocalizedRoutes();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  if (gate.pending) {
    return <AccountShellSkeleton variant="form" />;
  }

  const email = gate.user?.email ?? "";

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaved(false);
    if (password !== confirm) {
      setError(copy.passwordMismatch);
      return;
    }
    if (password.length < 6) {
      setError(copy.weakPassword);
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await updatePassword(password);
      setPassword("");
      setConfirm("");
      setSaved(true);
    } catch (err) {
      const message = err instanceof Error ? err.message.toLowerCase() : "";
      if (message.includes("weak") || message.includes("password should be")) {
        setError(copy.weakPassword);
      } else {
        setError(copy.passwordError);
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <AccountShell email={email} active="profile">
      <div className="rounded-[30px] bg-light-gray p-10 max-[600px]:rounded-[10px] max-[600px]:p-[15px]">
        <form
          onSubmit={(event) => void onSubmit(event)}
          className="flex gap-10 max-[1100px]:flex-col"
        >
          <div className="flex w-full max-w-[396px] flex-col items-center gap-5 max-[600px]:max-w-none">
            <h1 className="text-[24px] font-medium leading-[1.2] text-[#242424]">
              {copy.profileTitle}
            </h1>
            <span
              aria-hidden
              className="size-[163px] rounded-full bg-black/20 max-[600px]:size-20"
            />
          </div>

          <span
            aria-hidden
            className="hidden w-px self-stretch bg-[#d9d9d9] min-[1101px]:block max-[1100px]:h-px max-[1100px]:w-full max-[1100px]:self-auto"
          />

          <div className="flex w-full max-w-[396px] flex-col items-center gap-5 max-[600px]:max-w-none">
            <h2 className="text-center text-[24px] font-medium leading-[1.2] text-[#242424]">
              {copy.securityTitle}
            </h2>
            <AccountField
              label={copy.loginLabel}
              value={email}
              readOnly
              autoComplete="username"
            />
            <AccountField
              label={copy.newPassword}
              value={password}
              onChange={setPassword}
              type="password"
              autoComplete="new-password"
            />
            <AccountField
              label={copy.confirmPassword}
              value={confirm}
              onChange={setConfirm}
              type="password"
              autoComplete="new-password"
            />
            {error ? (
              <p role="alert" className="w-full text-[13px] leading-[1.4] text-accent-red">
                {error}
              </p>
            ) : null}
            {saved ? (
              <p role="status" className="w-full text-[13px] leading-[1.4] text-plum">
                {copy.passwordSaved}
              </p>
            ) : null}
            <Button
              type="submit"
              disabled={busy}
              className="h-[60px] w-full max-[600px]:h-[60px]"
            >
              {busy ? copy.saving : copy.save}
            </Button>
            <Link
              href={routes.accountOrders}
              className="text-[16px] font-medium leading-[1.3] text-plum underline decoration-solid underline-offset-4 transition-opacity duration-150 hover:opacity-80 max-[600px]:text-[13px]"
            >
              {copy.navOrders}
            </Link>
          </div>
        </form>
      </div>
    </AccountShell>
  );
}

function AccountField({
  label,
  value,
  onChange,
  type = "text",
  readOnly,
  autoComplete,
}: {
  label: string;
  value: string;
  onChange?: (value: string) => void;
  type?: "text" | "password";
  readOnly?: boolean;
  autoComplete?: string;
}) {
  return (
    <label className="flex w-full flex-col gap-3 max-[600px]:gap-2.5">
      <span className="text-[16px] leading-[1.5] text-[#242424] max-[600px]:text-[13px]">
        {label}
      </span>
      <input
        type={type}
        value={value}
        readOnly={readOnly}
        autoComplete={autoComplete}
        onChange={onChange ? (event) => onChange(event.target.value) : undefined}
        className="h-[62px] w-full rounded-[10px] bg-white px-5 text-[16px] leading-[1.5] text-[#242424] outline-none transition-shadow duration-150 focus:shadow-[0_0_0_2px_rgba(76,13,50,0.25)] max-[600px]:h-[50px] max-[600px]:text-[13px] read-only:cursor-default read-only:text-text/80"
      />
    </label>
  );
}
