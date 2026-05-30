"use client";

import Link from "next/link";
import { useState } from "react";
import { navLinks } from "@/lib/site-data";

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <header className="fixed left-0 right-0 top-0 z-40 px-4 pt-4 md:px-6">
        <nav className="mx-auto flex max-w-[1200px] items-center justify-between md:justify-start md:gap-8">
          <div className="hidden items-center gap-6 md:flex">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-base text-white transition hover:text-[#eb0b0b]"
              >
                {link.label}
              </Link>
            ))}
          </div>

          <Link
            href="#laifhack"
            className="btn-primary ml-auto hidden min-h-[44px] items-center justify-center rounded-full px-6 text-sm font-medium uppercase md:inline-flex"
          >
            Хочу также
          </Link>

          <button
            type="button"
            className="ml-auto flex h-7 w-7 flex-col justify-between md:hidden"
            onClick={() => setMenuOpen(true)}
            aria-label="Открыть меню"
            aria-expanded={menuOpen}
          >
            {[0, 1, 2, 3].map((i) => (
              <span
                key={i}
                className="block h-[3px] w-full bg-[#eb0b0b]"
                style={
                  i === 1 || i === 2
                    ? { width: "80%", marginLeft: "20%" }
                    : undefined
                }
              />
            ))}
          </button>
        </nav>
      </header>

      {menuOpen && (
        <div className="fixed inset-0 z-50 flex">
          <button
            type="button"
            className="absolute inset-0 bg-[#090808]/70"
            onClick={() => setMenuOpen(false)}
            aria-label="Закрыть меню"
          />
          <aside className="relative ml-auto flex h-full w-full max-w-xs flex-col bg-[#090808] p-8">
            <button
              type="button"
              onClick={() => setMenuOpen(false)}
              className="mb-10 self-end text-white"
              aria-label="Закрыть"
            >
              ✕
            </button>
            <ul className="flex flex-col gap-6">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-lg text-white"
                    onClick={() => setMenuOpen(false)}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  href="#laifhack"
                  className="btn-primary inline-flex min-h-[44px] items-center justify-center rounded-full px-6 text-base uppercase"
                  onClick={() => setMenuOpen(false)}
                >
                  Хочу также
                </Link>
              </li>
            </ul>
          </aside>
        </div>
      )}
    </>
  );
}
