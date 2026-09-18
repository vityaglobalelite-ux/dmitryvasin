"use client";

import Link from "next/link";
import {
  useId,
  useState,
  type InputHTMLAttributes,
  type ReactNode,
} from "react";
import { authAssets } from "@/components/site/auth/assets";
import { authT } from "@/components/site/auth/copy";
import { siteFocusRing } from "@/components/site/ui/Button";
import { Skeleton } from "@/components/site/ui/Skeleton";
import { clubPath } from "@/lib/club-config";
import { useLocale } from "@/lib/catalog/locale-context";

function cx(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}

type LeadingIcon = "mail" | "lock";

const leadingSrc: Record<LeadingIcon, string> = {
  mail: authAssets.mail,
  lock: authAssets.lock,
};

export type AuthFieldProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "className" | "id"
> & {
  label: string;
  leading: LeadingIcon;
  invalid?: boolean;
};

export function AuthField({
  label,
  leading,
  type = "text",
  invalid = false,
  ...inputProps
}: AuthFieldProps) {
  const id = useId();
  const copy = authT(useLocale());
  const [visible, setVisible] = useState(false);
  const isPassword = type === "password";
  const resolvedType = isPassword && visible ? "text" : type;

  return (
    <label className="flex w-full flex-col gap-2" htmlFor={id}>
      <span className="text-[16px] font-medium leading-[1.3] text-text max-[600px]:text-[13px] max-[600px]:font-normal max-[600px]:leading-[1.5]">
        {label}
      </span>
      <span
        className={cx(
          "flex h-[60px] items-center gap-5 rounded-[20px] border bg-light-gray px-5 py-4 transition-[border-color,box-shadow] duration-150 max-[600px]:h-[50px] max-[600px]:gap-2.5 max-[600px]:px-[15px]",
          invalid
            ? "border-accent-red"
            : "border-[#d9d9d9] focus-within:border-[rgba(76,13,50,0.4)] focus-within:shadow-[0_0_0_2px_rgba(76,13,50,0.18)]",
        )}
      >
        <img
          src={leadingSrc[leading]}
          alt=""
          width={20}
          height={20}
          className="size-5 shrink-0"
        />
        <span aria-hidden className="h-[21px] w-px shrink-0 bg-[#d9d9d9]" />
        <input
          id={id}
          type={resolvedType}
          aria-invalid={invalid || undefined}
          className={cx(
            "min-w-0 flex-1 appearance-none border-0 bg-transparent text-[16px] leading-[1.5] shadow-none outline-none placeholder:text-[#d9d9d9] max-[600px]:text-[13px]",
            invalid ? "text-accent-red" : "text-text",
          )}
          {...inputProps}
        />
        {isPassword ? (
          <button
            type="button"
            className={`flex size-6 shrink-0 items-center justify-center overflow-hidden rounded-full max-[600px]:size-4 ${siteFocusRing}`}
            onClick={() => setVisible((v) => !v)}
            aria-label={visible ? copy.hidePassword : copy.showPassword}
          >
            <img
              src={visible ? authAssets.eye : authAssets.eyeOff}
              alt=""
              width={visible ? 24 : 22}
              height={visible ? 24 : 20}
              className={
                visible
                  ? "size-6 max-[600px]:size-4"
                  : "h-5 w-[22px] max-[600px]:size-4"
              }
            />
          </button>
        ) : null}
      </span>
    </label>
  );
}

export function AuthBanner({
  tone,
  children,
}: {
  tone: "error" | "success";
  children: ReactNode;
}) {
  const src = tone === "error" ? authAssets.attention : authAssets.checkCircle;
  return (
    <div
      role={tone === "error" ? "alert" : "status"}
      className={cx(
        "flex w-full items-center gap-2.5 rounded-[10px] p-2.5 max-[600px]:min-h-8 max-[600px]:gap-1.5",
        tone === "error" ? "bg-[rgba(219,12,37,0.1)]" : "bg-[rgba(23,234,0,0.1)]",
      )}
    >
      <span className="relative size-5 shrink-0 overflow-hidden max-[600px]:size-4">
        <img
          src={src}
          alt=""
          width={20}
          height={20}
          className="absolute inset-0 size-full object-contain"
        />
      </span>
      <p
        className={cx(
          "text-[14px] font-medium leading-[1.2] max-[600px]:text-[10px]",
          tone === "error" ? "text-accent-red" : "text-[#17ea00]",
        )}
      >
        {children}
      </p>
    </div>
  );
}

export function PrivacyConsent({
  checked,
  onChange,
  requiredMessage,
}: {
  checked: boolean;
  onChange: (next: boolean) => void;
  requiredMessage?: string | null;
}) {
  const id = useId();
  const copy = authT(useLocale());
  const errorId = `${id}-error`;
  return (
    <div className="flex w-full flex-col gap-1.5">
      <div className="flex items-center gap-2.5">
        <input
          id={id}
          type="checkbox"
          checked={checked}
          onChange={(event) => onChange(event.target.checked)}
          aria-invalid={requiredMessage ? true : undefined}
          aria-describedby={requiredMessage ? errorId : undefined}
          aria-label={copy.privacy}
          className="peer sr-only"
        />
        <label
          htmlFor={id}
          className={cx(
            "relative size-[18px] shrink-0 cursor-pointer rounded-[5px] border bg-white peer-focus-visible:ring-2 peer-focus-visible:ring-plum/40 max-[600px]:size-4",
            requiredMessage ? "border-accent-red" : "border-plum",
          )}
        >
          <span
            aria-hidden
            className={cx(
              "absolute inset-[3px] rounded-[2px] bg-plum transition-opacity duration-150 max-[600px]:inset-[2px]",
              checked ? "opacity-100" : "opacity-0",
            )}
          />
        </label>
        <p className="text-[14px] font-medium leading-[1.2] text-text max-[600px]:text-[10px]">
          <label htmlFor={id} className="cursor-pointer">
            {copy.privacyLead}{" "}
          </label>
          <Link
            href={clubPath("privacy-policy")}
            target="_blank"
            rel="noreferrer"
            className={`text-plum underline-offset-2 hover:underline ${siteFocusRing}`}
          >
            {copy.privacyPolicy}
          </Link>
        </p>
      </div>
      {requiredMessage ? (
        <p
          id={errorId}
          role="alert"
          className="text-[12px] leading-[1.3] text-accent-red max-[600px]:text-[10px]"
        >
          {requiredMessage}
        </p>
      ) : null}
    </div>
  );
}

export function AuthCard({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cx(
        "flex w-full max-w-[462px] flex-col gap-10 rounded-[30px] bg-white p-10 max-[600px]:max-w-[320px] max-[600px]:gap-5 max-[600px]:rounded-[10px] max-[600px]:p-[15px]",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function AuthTitle({
  children,
  id,
  as: Tag = "h1",
}: {
  children: ReactNode;
  id?: string;
  as?: "h1" | "h2";
}) {
  return (
    <Tag
      id={id}
      className="w-full text-center text-[24px] font-medium leading-[1.2] text-text max-[600px]:text-[16px] max-[600px]:leading-[1.3]"
    >
      {children}
    </Tag>
  );
}

const switchActionClass =
  `rounded-[4px] font-semibold text-plum underline underline-offset-2 ${siteFocusRing}`;

export function AuthSwitch({
  prompt,
  action,
  href,
  onAction,
}: {
  prompt: string;
  action: string;
  href?: string;
  onAction?: () => void;
}) {
  return (
    <div className="flex w-full flex-col gap-[30px] max-[600px]:gap-5">
      <div className="h-px w-full bg-[#d9d9d9]" />
      <p className="text-center text-[16px] leading-[1.5] text-text max-[600px]:text-[13px]">
        {prompt}{" "}
        {onAction ? (
          <button type="button" className={switchActionClass} onClick={onAction}>
            {action}
          </button>
        ) : (
          <Link href={href ?? "#"} className={switchActionClass}>
            {action}
          </Link>
        )}
      </p>
    </div>
  );
}

export function AuthScreen({ children }: { children: ReactNode }) {
  return (
    <main className="relative flex min-h-0 flex-1 flex-col items-center justify-center px-5 py-16 max-[600px]:py-10">
      <div className="absolute inset-0 bg-black/30" aria-hidden />
      <div className="relative w-full max-w-[462px] max-[600px]:max-w-[320px]">{children}</div>
    </main>
  );
}

export function AuthScreenSkeleton({ fields }: { fields: number }) {
  return (
    <AuthScreen>
      <AuthCard>
        <div className="flex flex-col items-center gap-5 max-[600px]:gap-2.5">
          <Skeleton className="h-8 w-[240px] rounded-[8px] max-[600px]:h-5 max-[600px]:w-[180px]" />
          <div className="flex w-full flex-col gap-4">
            {Array.from({ length: fields }, (_, index) => (
              <div key={index} className="flex flex-col gap-2">
                <Skeleton className="h-5 w-16 max-[600px]:h-4" />
                <Skeleton className="h-[60px] w-full rounded-[20px] max-[600px]:h-[50px]" />
              </div>
            ))}
          </div>
        </div>
        <Skeleton className="h-[60px] w-full rounded-[60px] max-[600px]:h-[50px]" />
      </AuthCard>
    </AuthScreen>
  );
}
