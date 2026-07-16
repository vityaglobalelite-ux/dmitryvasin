type Props = {
  href?: string;
  children: React.ReactNode;
  variant?: "gradient" | "light";
  className?: string;
};

export function PrimaryButton({
  href = "#tariffs",
  children,
  variant = "gradient",
  className = "",
}: Props) {
  const base =
    "inline-flex h-[60px] w-[259px] items-center justify-center rounded-[60px] text-[16px] font-semibold transition hover:brightness-110";
  const look =
    variant === "gradient"
      ? "bg-gradient-to-r from-[#9e151e] to-[#4c0d32] text-white"
      : "bg-white text-[#4c0d32]";
  return (
    <a href={href} className={`${base} ${look} ${className}`}>
      {children}
    </a>
  );
}
