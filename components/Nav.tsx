"use client";

import { useState } from "react";
import { useAuth } from "@/components/PasswordGate";

const links = [
  { href: "/#home", label: "Home" },
  { href: "/contests", label: "Contests" },
  { href: "/movies", label: "Movie Verdicts" },
];

export default function Nav() {
  const [open, setOpen] = useState(false);
  const { unlocked, logout } = useAuth();

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-ink/80 backdrop-blur-md">
      <nav className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3 sm:px-6">
        <a href="/#home" className="flex items-center gap-2" onClick={() => setOpen(false)}>
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-brand-green to-grape text-lg shadow-pop">
            🤝
          </span>
          <span className="font-display text-lg font-extrabold tracking-tight text-white">
            Friends<span className="text-brand-green">Community</span>
          </span>
        </a>

        {/* Desktop / tablet links */}
        <ul className="hidden items-center gap-1 md:flex">
          {links.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                className="rounded-full px-4 py-2 text-sm font-semibold text-white/70 transition hover:bg-white/10 hover:text-white"
              >
                {link.label}
              </a>
            </li>
          ))}
          {unlocked && (
            <li>
              <button
                type="button"
                onClick={logout}
                className="ml-1 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm font-semibold text-white/80 transition hover:border-sunset/40 hover:bg-sunset/10 hover:text-white"
              >
                Logout
              </button>
            </li>
          )}
        </ul>

        {/* Mobile hamburger */}
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle menu"
          aria-expanded={open}
          className="grid h-10 w-10 place-items-center rounded-xl border border-white/10 bg-white/5 text-white md:hidden"
        >
          <span className="relative block h-4 w-5">
            <span
              className={`absolute left-0 top-0 h-0.5 w-5 rounded bg-current transition-transform duration-300 ${
                open ? "translate-y-[7px] rotate-45" : ""
              }`}
            />
            <span
              className={`absolute left-0 top-[7px] h-0.5 w-5 rounded bg-current transition-opacity duration-300 ${
                open ? "opacity-0" : "opacity-100"
              }`}
            />
            <span
              className={`absolute left-0 top-[14px] h-0.5 w-5 rounded bg-current transition-transform duration-300 ${
                open ? "-translate-y-[7px] -rotate-45" : ""
              }`}
            />
          </span>
        </button>
      </nav>

      {/* Mobile slide-down menu */}
      <div
        className={`overflow-hidden border-t border-white/10 transition-[max-height] duration-300 md:hidden ${
          open ? "max-h-72" : "max-h-0"
        }`}
      >
        <ul className="flex flex-col gap-1 px-4 py-3">
          {links.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                onClick={() => setOpen(false)}
                className="block rounded-xl px-4 py-3 text-base font-semibold text-white/80 transition hover:bg-white/10 hover:text-white"
              >
                {link.label}
              </a>
            </li>
          ))}
          {unlocked && (
            <li>
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  logout();
                }}
                className="mt-1 block w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-left text-base font-semibold text-white/80 transition hover:border-sunset/40 hover:bg-sunset/10 hover:text-white"
              >
                Logout
              </button>
            </li>
          )}
        </ul>
      </div>
    </header>
  );
}
