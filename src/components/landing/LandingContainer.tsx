import type { ReactNode } from "react";

type LandingContainerProps = {
  children: ReactNode;
  className?: string;
  id?: string;
};

export function LandingContainer({
  children,
  className = "",
  id,
}: LandingContainerProps) {
  return (
    <div
      id={id}
      className={`mx-auto w-full max-w-[1440px] px-5 md:px-10 xl:px-0 ${className}`}
    >
      {children}
    </div>
  );
}
