"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/items", label: "Browse" },
  { href: "/stats", label: "Stats" },
  { href: "/games", label: "Games" },
];

export function Navbar() {
  const { user, logout, loading } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <header className="sticky top-0 z-50 border-b border-cream-300 bg-cream-50/80 backdrop-blur-xl">
      <nav
        className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4"
        aria-label="Main navigation"
      >
        <Link
          href="/"
          className="flex items-center gap-2 transition-opacity hover:opacity-80"
        >
          <span className="text-lg font-bold uppercase tracking-[0.15em] text-ink">Lost & Found</span>
          <span className="hidden text-xs font-medium uppercase tracking-[0.2em] text-ink-muted sm:inline">Pantry Provisions</span>
        </Link>

        <ul className="hidden items-center gap-8 md:flex">
          {NAV_LINKS.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className={`relative pb-1 text-sm font-semibold uppercase tracking-wider transition-colors ${
                  isActive(link.href)
                    ? "text-ink"
                    : "text-ink-faint hover:text-ink"
                }`}
              >
                {link.label}
                {isActive(link.href) && (
                  <span
                    className="absolute bottom-0 left-0 h-0.5 w-full rounded-full bg-coral"
                    aria-hidden="true"
                  />
                )}
              </Link>
            </li>
          ))}
        </ul>

        <div className="hidden items-center gap-3 md:flex">
          {loading ? null : user ? (
            <>
              {user.role === "admin" && (
                <Link
                  href="/admin"
                  className="text-sm font-semibold text-coral transition-opacity hover:opacity-80"
                >
                  Admin
                </Link>
              )}
              <span className="text-sm text-ink-muted">{user.name ?? "_"}</span>
              <button type="button" onClick={logout} className="btn-secondary text-xs">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link href="/auth/login" className="btn-secondary text-xs">
                Login
              </Link>
              <Link href="/auth/register" className="btn-primary text-xs">
                Register
              </Link>
            </>
          )}
        </div>

        <button
          type="button"
          className="rounded-xl p-2 text-ink-muted transition-colors hover:bg-cream-200 hover:text-ink md:hidden"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-expanded={menuOpen}
          aria-label="Toggle navigation menu"
        >
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            {menuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </nav>

      {menuOpen && (
        <div className="border-t border-cream-300 bg-white px-4 py-6 md:hidden">
          <ul className="flex flex-col gap-1">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={`block rounded-xl px-4 py-3 text-sm font-semibold uppercase tracking-wider transition-colors ${
                    isActive(link.href)
                      ? "bg-cream-200 text-coral"
                      : "text-ink-muted hover:bg-cream-100 hover:text-ink"
                  }`}
                  onClick={() => setMenuOpen(false)}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
          <div className="divider" />
          <div className="flex flex-col gap-2">
            {loading ? null : user ? (
              <>
                {user.role === "admin" && (
                  <Link
                    href="/admin"
                    className="block px-4 py-2 text-sm font-semibold text-coral"
                    onClick={() => setMenuOpen(false)}
                  >
                    Admin Panel
                  </Link>
                )}
                <span className="px-4 text-sm text-ink-muted">{user.name ?? "_"}</span>
                <button
                  type="button"
                  onClick={() => { logout(); setMenuOpen(false); }}
                  className="btn-secondary text-xs"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/auth/login"
                  className="btn-secondary text-center text-xs"
                  onClick={() => setMenuOpen(false)}
                >
                  Login
                </Link>
                <Link
                  href="/auth/register"
                  className="btn-primary text-center text-xs"
                  onClick={() => setMenuOpen(false)}
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
