"use client";

import { useId, useState, type InputHTMLAttributes } from "react";
import { siteAssets } from "@/lib/catalog/assets";
import { useCatalogT } from "@/lib/catalog/locale-context";

type LeadingIcon = "mail" | "lock";

export type TextFieldProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "className" | "id"
> & {
  label: string;
  leading?: LeadingIcon;
  className?: string;
};

const leadingSrc: Record<LeadingIcon, string> = {
  mail: siteAssets.fieldMail,
  lock: siteAssets.fieldLock,
};

export function TextField({
  label,
  leading,
  type = "text",
  className,
  ...inputProps
}: TextFieldProps) {
  const id = useId();
  const copy = useCatalogT();
  const [visible, setVisible] = useState(false);
  const isPassword = type === "password";
  const resolvedType = isPassword && visible ? "text" : type;

  return (
    <label
      className={["flex w-full flex-col gap-2", className]
        .filter(Boolean)
        .join(" ")}
      htmlFor={id}
    >
      <span className="text-[16px] font-medium leading-[1.3] text-text">
        {label}
      </span>
      <span className="flex h-[60px] items-center gap-5 rounded-[20px] border border-[#d9d9d9] bg-light-gray px-5 py-4 transition-colors duration-150 focus-within:border-[rgba(76,13,50,0.4)]">
        {leading ? (
          <img
            src={leadingSrc[leading]}
            alt=""
            width={20}
            height={20}
            className="size-5 shrink-0"
          />
        ) : null}
        {leading ? (
          <span
            aria-hidden
            className="h-[21px] w-px shrink-0 bg-[#d9d9d9]"
          />
        ) : null}
        <input
          id={id}
          type={resolvedType}
          className="min-w-0 flex-1 bg-transparent text-[16px] leading-[1.5] text-text outline-none placeholder:text-[#d9d9d9]"
          {...inputProps}
        />
        {isPassword ? (
          <button
            type="button"
            className="flex size-6 shrink-0 items-center justify-center overflow-hidden"
            onClick={() => setVisible((v) => !v)}
            aria-label={visible ? copy.ui.hidePassword : copy.ui.showPassword}
          >
            <img
              src={visible ? siteAssets.eye : siteAssets.eyeOff}
              alt=""
              width={visible ? 24 : 22}
              height={visible ? 24 : 20}
              className={visible ? "size-6" : "h-5 w-[22px]"}
            />
          </button>
        ) : null}
      </span>
    </label>
  );
}
