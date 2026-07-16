"use client";

import { useState } from "react";
import { navLinks } from "@/lib/landing-data";
import { LandingContainer } from "./LandingContainer";
import { Logo } from "./Logo";

export function Nav() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white/95 py-5 backdrop-blur-sm">
      <LandingContainer>
        <nav className="flex h-[66px] items-center justify-between rounded-[20px] bg-white px-6 shadow-[0_4px_24px_rgba(0,0,0,0.08)]">
          <div className="hidden items-center gap-8 lg:flex">
            {navLinks.slice(0, 2).map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-[16px] font-medium text-text no-underline transition-opacity hover:opacity-70"
              >
                {link.label}
              </a>
            ))}
          </div>

          <Logo />

          <div className="hidden items-center gap-10 lg:flex">
            {navLinks.slice(2).map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-[16px] font-medium text-text no-underline transition-opacity hover:opacity-70"
              >
                {link.label}
              </a>
            ))}
          </div>

          <button
            type="button"
            className="flex size-10 flex-col items-center justify-center gap-1.5 lg:hidden"
            onClick={() => setOpen((v) => !v)}
            aria-label="Меню"
          >
            <span className="block h-0.5 w-6 bg-text-dark" />
            <span className="block h-0.5 w-6 bg-text-dark" />
            <span className="block h-0.5 w-6 bg-text-dark" />
          </button>
        </nav>

        {open && (
          <div className="mt-3 flex flex-col gap-4 rounded-[20px] bg-white p-6 shadow-[0_4px_24px_rgba(0,0,0,0.08)] lg:hidden">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-[16px] font-medium text-text no-underline"
                onClick={() => setOpen(false)}
              >
                {link.label}
              </a>
            ))}
          </div>
        )}
      </LandingContainer>
    </header>
  );
}
