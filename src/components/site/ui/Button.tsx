import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";

const variants = {
  primary:
    "h-[60px] rounded-[60px] bg-[image:var(--cta-gradient)] px-10 text-[16px] font-semibold tracking-[0.2px] text-white max-[600px]:h-[50px] max-[600px]:px-8",
  secondary:
    "h-[60px] rounded-[60px] border border-plum bg-transparent px-10 text-[16px] font-semibold text-plum max-[600px]:h-[50px] max-[600px]:px-8",
  chip: "h-[35px] gap-1 rounded-[60px] border border-[#c9c9c9] bg-white px-[15px] text-[16px] font-semibold text-plum max-[600px]:h-8 max-[600px]:text-[13px] max-[600px]:font-normal",
} as const;

export type SiteButtonVariant = keyof typeof variants;

type CommonProps = {
  variant?: SiteButtonVariant;
  className?: string;
  children: ReactNode;
};

type ButtonAsButton = CommonProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, "className" | "children"> & {
    href?: undefined;
  };

type ButtonAsLink = CommonProps & {
  href: string;
  type?: never;
  disabled?: boolean;
};

export type SiteButtonProps = ButtonAsButton | ButtonAsLink;

function buttonClassName(variant: SiteButtonVariant, className?: string) {
  const hasPx = Boolean(className && /(?:^|\s)px-/.test(className));
  const hasMobilePx = Boolean(className && /max-\[600px\]:px-/.test(className));
  let variantCls: string = variants[variant];
  if (hasPx) {
    variantCls = variantCls
      .replace(/\bpx-10\b/g, "")
      .replace(/\bpx-\[15px\]\b/g, "");
  }
  if (hasPx || hasMobilePx) {
    variantCls = variantCls.replace(/\bmax-\[600px\]:px-8\b/g, "");
  }

  return [
    "inline-flex items-center justify-center whitespace-nowrap font-[inherit] leading-normal transition-[filter,transform,opacity] duration-200 ease-out",
    "hover:brightness-105 active:scale-[0.98]",
    "disabled:pointer-events-none disabled:opacity-50",
    variantCls,
    className,
  ]
    .filter(Boolean)
    .join(" ");
}

export function Button(props: SiteButtonProps) {
  const { variant = "primary", className, children } = props;
  const cls = buttonClassName(variant, className);

  if ("href" in props && props.href) {
    return (
      <Link href={props.href} className={cls} aria-disabled={props.disabled}>
        {children}
      </Link>
    );
  }

  const {
    variant: _variant,
    className: _className,
    children: _children,
    href: _href,
    type,
    ...rest
  } = props as ButtonAsButton;
  return (
    <button type={type ?? "button"} className={cls} {...rest}>
      {children}
    </button>
  );
}
