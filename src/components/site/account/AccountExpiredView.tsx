"use client";

import {
  AccountBackLink,
  AccountShell,
  AccountShellSkeleton,
} from "@/components/site/account/AccountShell";
import { accountT } from "@/components/site/account/copy";
import { useAccountGate } from "@/components/site/account/use-account-gate";
import { Button } from "@/components/site/ui/Button";
import { useLocale, useLocalizedRoutes } from "@/lib/catalog/locale-context";

export function AccountExpiredView() {
  const gate = useAccountGate();
  const copy = accountT(useLocale());
  const routes = useLocalizedRoutes();

  if (gate.pending) {
    return <AccountShellSkeleton variant="form" />;
  }

  return (
    <AccountShell email={gate.user?.email} active="materials">
      <div className="flex max-w-[720px] flex-col gap-5">
        <AccountBackLink />
        <h1 className="text-[50px] font-medium leading-[1.1] tracking-[-1.5px] text-text max-[600px]:text-[30px] max-[600px]:tracking-[-0.9px]">
          {copy.expiredTitle}
        </h1>
        <p className="text-[16px] leading-[1.5] text-text max-[600px]:text-[13px]">
          {copy.expiredBody}
        </p>
        <div
          aria-label={copy.expiredSlotLabel}
          className="flex min-h-[220px] items-center justify-center rounded-[20px] bg-light-gray max-[600px]:min-h-[180px] max-[600px]:rounded-[10px]"
        />
        <Button href={routes.account} className="w-fit max-[600px]:w-full">
          {copy.expiredBack}
        </Button>
      </div>
    </AccountShell>
  );
}
