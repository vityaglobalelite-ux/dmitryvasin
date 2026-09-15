"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { accountAssets } from "@/components/site/account/assets";
import { AccountAvatar } from "@/components/site/account/AccountAvatar";
import { accountT } from "@/components/site/account/copy";
import { Skeleton } from "@/components/site/ui/Skeleton";
import { useCatalogT, useLocale, useLocalizedRoutes } from "@/lib/catalog/locale-context";
import {
  getMyProfile,
  onProfileChanged,
  profileAvatarSrc,
  profileDisplayName,
} from "@/lib/catalog/repo/profile";
import { signOut } from "@/lib/supabase/auth";
import type { Profile } from "@/lib/catalog/types";

export type AccountNavId = "materials" | "profile" | "orders" | "support";

function cx(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}

function useAccountProfile(email?: string | null): Profile | null {
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const data = await getMyProfile();
        if (!cancelled) setProfile(data);
      } catch {
        if (!cancelled) setProfile(null);
      }
    }

    void load();
    const unsubscribe = onProfileChanged(() => {
      void load();
    });
    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, [email]);

  return profile;
}

function AccountSidebarAvatar({ src }: { src: string | null }) {
  const [revealKey, setRevealKey] = useState(0);
  const first = useRef(true);

  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    setRevealKey((key) => key + 1);
  }, [src]);

  return (
    <AccountAvatar
      src={src}
      size={89}
      className="size-[89px] shrink-0"
      tone="onBrand"
      revealKey={revealKey}
    />
  );
}

function personName(
  profile: Profile | null,
  email: string | null | undefined,
  fallback: string,
): string {
  return profileDisplayName(
    profile ?? { firstName: "", lastName: "", email: email ?? "" },
    fallback,
  );
}

export function AccountShell({
  email,
  active,
  children,
}: {
  email?: string | null;
  active: AccountNavId;
  children: ReactNode;
}) {
  const profile = useAccountProfile(email);
  return (
    <main className="mx-auto w-full flex-1 px-[12.5%] pb-24 pt-[75px] max-[600px]:px-5 max-[600px]:pb-16 max-[600px]:pt-6">
      <div className="flex items-start gap-5 max-[1100px]:flex-col">
        <AccountMobileNav email={email} profile={profile} active={active} />
        <AccountSidebar email={email} profile={profile} active={active} />
        <div className="min-w-0 flex-1">{children}</div>
      </div>
    </main>
  );
}

export function AccountShellSkeleton({
  variant = "cards",
}: {
  variant?: "cards" | "player" | "form" | "rows";
}) {
  return (
    <main className="mx-auto w-full flex-1 px-[12.5%] pb-24 pt-[75px] max-[600px]:px-5 max-[600px]:pb-16 max-[600px]:pt-6">
      <div className="flex items-start gap-5 max-[1100px]:flex-col">
        <Skeleton className="h-[72px] w-full rounded-[16px] min-[1101px]:hidden" />
        <Skeleton className="hidden h-[463px] w-full max-w-[467px] rounded-[30px] min-[1101px]:block" />
        <div className="flex min-w-0 flex-1 flex-col gap-5">
          <Skeleton className="h-[55px] w-[min(80%,520px)] rounded-[12px] max-[600px]:h-8" />
          {variant === "player" ? (
            <Skeleton className="aspect-video w-full rounded-[30px] max-[600px]:rounded-[10px]" />
          ) : null}
          {variant === "form" ? (
            <Skeleton className="h-[640px] w-full rounded-[30px] max-[600px]:h-[720px] max-[600px]:rounded-[10px]" />
          ) : null}
          {variant === "rows" ? (
            <div className="flex flex-col gap-3">
              {Array.from({ length: 4 }, (_, i) => (
                <Skeleton key={i} className="h-[88px] w-full rounded-[20px]" />
              ))}
            </div>
          ) : null}
          {variant === "cards" ? (
            <div className="flex flex-col gap-5">
              <AccountMaterialCardSkeleton />
              <AccountMaterialCardSkeleton />
            </div>
          ) : null}
        </div>
      </div>
    </main>
  );
}

export function AccountMaterialCardSkeleton() {
  return (
    <article
      aria-hidden
      className="flex overflow-hidden rounded-[20px] bg-light-gray max-[600px]:flex-col max-[600px]:rounded-[20px]"
    >
      <Skeleton className="h-[275px] w-[467px] shrink-0 rounded-[20px] max-[600px]:h-[180px] max-[600px]:w-full max-[600px]:rounded-[10px]" />
      <div className="flex min-w-0 flex-1 flex-col gap-5 p-5 max-[600px]:gap-5 max-[600px]:p-[15px]">
        <div className="flex gap-3.5 max-[600px]:gap-1">
          <Skeleton className="h-10 w-[144px] rounded-[10px] max-[600px]:h-6 max-[600px]:w-[104px]" />
          <Skeleton className="h-10 w-[102px] rounded-[10px] max-[600px]:h-6 max-[600px]:w-[74px]" />
        </div>
        <Skeleton className="h-[58px] w-full max-[600px]:h-[42px]" />
        <div className="flex h-10 flex-col justify-end gap-2.5">
          <Skeleton className="h-1.5 w-full rounded-[10px]" />
          <Skeleton className="h-3 w-[180px]" />
        </div>
        <Skeleton className="h-[45px] w-[120px] rounded-[60px] max-[600px]:h-[50px] max-[600px]:w-full" />
      </div>
    </article>
  );
}

function useAccountLogout() {
  const router = useRouter();
  const copy = accountT(useLocale());
  const routes = useLocalizedRoutes();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onLogout() {
    setError(null);
    setBusy(true);
    try {
      await signOut();
      router.replace(routes.home);
    } catch {
      setError(copy.logoutError);
      setBusy(false);
    }
  }

  return { busy, error, onLogout };
}

function AccountMobileNav({
  email,
  profile,
  active,
}: {
  email?: string | null;
  profile: Profile | null;
  active: AccountNavId;
}) {
  const { busy, error, onLogout } = useAccountLogout();
  const copy = accountT(useLocale());
  const routes = useLocalizedRoutes();
  const profileFallback = useCatalogT().pages.accountProfile;

  return (
    <div className="flex w-full flex-col gap-4 min-[1101px]:hidden">
      <div className="flex items-center justify-between gap-3">
        <p className="min-w-0 truncate text-[16px] font-medium leading-[1.3] text-text max-[600px]:text-[13px]">
          {personName(profile, email, profileFallback)}
        </p>
        <button
          type="button"
          onClick={() => void onLogout()}
          disabled={busy}
          className="shrink-0 rounded-[10px] bg-[image:var(--brand-gradient)] px-2.5 py-1.5 text-[13px] font-medium leading-[1.3] text-white transition-[filter,transform] duration-200 hover:brightness-105 active:scale-[0.98] disabled:opacity-50"
        >
          {copy.logout}
        </button>
      </div>
      <nav className="flex flex-wrap gap-x-5 gap-y-2">
        <MobileNavLink
          href={routes.account}
          label={copy.navMaterials}
          active={active === "materials"}
        />
        <MobileNavLink
          href={routes.accountOrders}
          label={copy.navOrders}
          active={active === "orders"}
        />
        <MobileNavLink
          href={routes.accountProfile}
          label={copy.navProfile}
          active={active === "profile"}
        />
      </nav>
      {error ? (
        <p className="text-[13px] leading-[1.4] text-accent-red">{error}</p>
      ) : null}
    </div>
  );
}

function MobileNavLink({
  href,
  label,
  active,
}: {
  href: string;
  label: string;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className={cx(
        "text-[16px] leading-[1.3] transition-opacity duration-150 hover:opacity-80 max-[600px]:text-[13px]",
        active ? "font-bold text-plum" : "font-medium text-text",
      )}
    >
      {label}
    </Link>
  );
}

function AccountSidebar({
  email,
  profile,
  active,
}: {
  email?: string | null;
  profile: Profile | null;
  active: AccountNavId;
}) {
  const { busy, error, onLogout } = useAccountLogout();
  const copy = accountT(useLocale());
  const routes = useLocalizedRoutes();
  const profileFallback = useCatalogT().pages.accountProfile;

  return (
    <aside className="hidden w-full max-w-[467px] shrink-0 min-[1101px]:block">
      <div className="flex flex-col gap-[31px] rounded-[30px] bg-[image:var(--brand-gradient)] p-10">
        <div className="flex items-center gap-5">
          <AccountSidebarAvatar src={profileAvatarSrc(profile)} />
          <div className="flex min-w-0 flex-col items-start gap-2.5">
            <p className="truncate text-[24px] font-medium leading-[1.2] text-white">
              {personName(profile, email, profileFallback)}
            </p>
            <button
              type="button"
              onClick={() => void onLogout()}
              disabled={busy}
              className="rounded-[10px] bg-white px-2.5 py-1.5 text-[16px] font-medium leading-[1.3] text-accent-orange transition-[filter,transform] duration-200 hover:brightness-105 active:scale-[0.98] disabled:opacity-50"
            >
              {copy.logout}
            </button>
          </div>
        </div>

        <nav className="relative overflow-visible flex flex-col gap-5 rounded-[20px] bg-white p-5">
          <SidebarLink
            href={routes.account}
            icon={accountAssets.materials}
            label={copy.navMaterials}
            active={active === "materials"}
          />
          <span aria-hidden className="h-px w-full bg-[#ececec]" />
          <SidebarLink
            href={routes.accountOrders}
            icon={accountAssets.orders}
            label={copy.navOrders}
            active={active === "orders"}
          />
          <span aria-hidden className="h-px w-full bg-[#ececec]" />
          <SidebarLink
            href={routes.accountProfile}
            icon={accountAssets.settings}
            label={copy.navProfile}
            active={active === "profile"}
          />
        </nav>

        <span aria-hidden className="h-px w-full bg-white/40" />

        <Link
          href={routes.accountSupport}
          className="inline-flex h-[60px] w-full items-center justify-center gap-2.5 rounded-[60px] bg-[image:var(--cta-gradient)] text-[16px] font-semibold text-white transition-[filter,transform] duration-200 hover:brightness-105 active:scale-[0.98]"
        >
          {copy.navSupport}
          <img
            src={accountAssets.telegram}
            alt=""
            width={24}
            height={24}
            className="size-6"
          />
        </Link>

        {error ? (
          <p className="text-[13px] leading-[1.4] text-white/90">{error}</p>
        ) : null}
      </div>
    </aside>
  );
}

function SidebarLink({
  href,
  icon,
  label,
  active,
}: {
  href: string;
  icon: string;
  label: string;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className="relative flex items-center gap-2.5 text-[16px] leading-[1.2] text-text transition-opacity duration-150 hover:opacity-80"
    >
      {active ? (
        <img
          src={accountAssets.navCaret}
          alt=""
          width={11}
          height={13}
          className="pointer-events-none absolute top-1/2 left-[-18px] z-10 h-[13px] w-[11px] -translate-y-1/2 rotate-90"
        />
      ) : null}
      <img src={icon} alt="" width={24} height={24} className="size-6 shrink-0" />
      <span className={cx(active ? "font-bold" : "font-medium", "leading-[1.3]")}>
        {label}
      </span>
    </Link>
  );
}

export function AccountBackLink() {
  const copy = accountT(useLocale());
  const routes = useLocalizedRoutes();
  return (
    <Link
      href={routes.account}
      className="inline-flex items-center gap-2.5 text-[16px] font-semibold leading-normal text-plum transition-opacity duration-150 hover:opacity-80 max-[600px]:gap-1.5 max-[600px]:text-[13px] max-[600px]:leading-[1.5]"
    >
      <span className="flex h-2.5 w-[5px] items-center justify-center">
        <img
          src={accountAssets.back}
          alt=""
          width={10}
          height={5}
          className="h-[5px] w-2.5 -rotate-90"
        />
      </span>
      {copy.backToMaterials}
    </Link>
  );
}
