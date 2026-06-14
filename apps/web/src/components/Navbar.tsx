"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { useTheme } from "@/lib/ThemeProvider";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/items", label: "Browse" },
  { href: "/stats", label: "Stats" },
  { href: "/games", label: "Games" },
];

export function Navbar() {
  const { user, logout, loading } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    setProfileOpen(false);
    await logout();
    router.push("/");
  };

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-bg/60 backdrop-blur-xl">
      <nav
        className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 md:px-10"
        aria-label="Main navigation"
      >
        <Link
          href="/"
          className="flex items-center gap-2 transition-opacity hover:opacity-80"
        >
          <span className="text-lg font-bold text-text">Lost & Found</span>
        </Link>

        <ul className="hidden items-center gap-8 md:flex">
          {NAV_LINKS.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className={`relative pb-1 text-sm font-medium transition-colors ${
                  isActive(link.href)
                    ? "text-text"
                    : "text-text-muted hover:text-text"
                }`}
              >
                {link.label}
                {isActive(link.href) && (
                  <span
                    className="absolute bottom-0 left-0 h-0.5 w-full rounded-full bg-accent"
                    aria-hidden="true"
                  />
                )}
              </Link>
            </li>
          ))}
        </ul>

        <div className="hidden items-center gap-3 md:flex">
          {/* Theme toggle */}
          <button
            type="button"
            onClick={toggleTheme}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-border-light text-text-muted transition-colors hover:bg-bg-hover hover:text-text"
            aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
          >
            {theme === "dark" ? (
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            ) : (
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            )}
          </button>

          {loading ? null : user ? (
            <div className="relative" ref={profileRef}>
              <button
                type="button"
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center gap-2 rounded-full border border-border-light px-3 py-1.5 text-sm font-medium text-text transition-colors hover:bg-bg-hover hover:border-accent/30"
              >
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-accent text-xs font-bold text-bg">
                  {(user.name ?? "?").charAt(0).toUpperCase()}
                </span>
                <span className="max-w-[120px] truncate">{user.name ?? "_"}</span>
                <svg className={`h-4 w-4 text-text-muted transition-transform ${profileOpen ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {profileOpen && (
                <div className="absolute right-0 mt-2 w-56 overflow-hidden rounded-xl border border-border-light bg-bg-elevated shadow-lg shadow-black/40">
                  <div className="border-b border-border px-4 py-3">
                    <p className="text-sm font-semibold text-text">{user.name ?? "_"}</p>
                    <p className="text-xs text-text-muted">{user.email ?? "_"}</p>
                  </div>
                  <div className="py-1">
                    <Link
                      href="/profile"
                      className="flex items-center gap-2 px-4 py-2 text-sm text-text-secondary transition-colors hover:bg-bg-hover hover:text-text"
                      onClick={() => setProfileOpen(false)}
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      My Profile
                    </Link>
                    <Link
                      href="/claims"
                      className="flex items-center gap-2 px-4 py-2 text-sm text-text-secondary transition-colors hover:bg-bg-hover hover:text-text"
                      onClick={() => setProfileOpen(false)}
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                      </svg>
                      My Claims
                    </Link>
                    <Link
                      href="/chat"
                      className="flex items-center gap-2 px-4 py-2 text-sm text-text-secondary transition-colors hover:bg-bg-hover hover:text-text"
                      onClick={() => setProfileOpen(false)}
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                      Messages
                    </Link>
                    {user.role === "admin" && (
                      <Link
                        href="/admin"
                        className="flex items-center gap-2 px-4 py-2 text-sm text-text-secondary transition-colors hover:bg-bg-hover hover:text-text"
                        onClick={() => setProfileOpen(false)}
                      >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        Admin Panel
                      </Link>
                    )}
                    <Link
                      href="/leaderboard"
                      className="flex items-center gap-2 px-4 py-2 text-sm text-text-secondary transition-colors hover:bg-bg-hover hover:text-text"
                      onClick={() => setProfileOpen(false)}
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                      Leaderboard
                    </Link>
                  </div>
                  <div className="border-t border-border py-1">
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-400 transition-colors hover:bg-red-950/30"
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link href="/auth/login" className="text-sm font-medium text-text-secondary transition-colors hover:text-text">
                Sign in
              </Link>
            </>
          )}
        </div>

        <div className="flex items-center gap-2 md:hidden">
          <button
            type="button"
            onClick={toggleTheme}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-border-light text-text-muted transition-colors hover:bg-bg-hover hover:text-text"
            aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
          >
            {theme === "dark" ? (
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            ) : (
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            )}
          </button>
          {loading ? null : user ? (
            <button
              type="button"
              className="rounded-xl p-2 text-text-muted transition-colors hover:bg-bg-hover hover:text-text"
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
          ) : (
            <Link href="/auth/login" className="rounded-full bg-accent px-4 py-2 text-sm font-semibold text-bg transition-colors hover:bg-accent-light">
              Sign in
            </Link>
          )}
        </div>
      </nav>

      {menuOpen && (
        <div className="border-t border-border bg-bg-elevated px-4 py-6 md:hidden">
          <ul className="flex flex-col gap-1">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={`block rounded-xl px-4 py-3 text-sm font-medium transition-colors ${
                    isActive(link.href)
                      ? "bg-accent/10 text-accent"
                      : "text-text-secondary hover:bg-bg-hover hover:text-text"
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
                <div className="flex items-center gap-3 px-4 py-2">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-accent text-sm font-bold text-bg">
                    {(user.name ?? "?").charAt(0).toUpperCase()}
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-text">{user.name ?? "_"}</p>
                    <p className="text-xs text-text-muted">{user.email ?? "_"}</p>
                  </div>
                </div>
                <Link href="/profile" className="block px-4 py-2 text-sm text-text-secondary" onClick={() => setMenuOpen(false)}>
                  My Profile
                </Link>
                <Link href="/claims" className="block px-4 py-2 text-sm text-text-secondary" onClick={() => setMenuOpen(false)}>
                  My Claims
                </Link>
                <Link href="/chat" className="block px-4 py-2 text-sm text-text-secondary" onClick={() => setMenuOpen(false)}>
                  Messages
                </Link>
                {user.role === "admin" && (
                  <Link href="/admin" className="block px-4 py-2 text-sm text-accent" onClick={() => setMenuOpen(false)}>
                    Admin Panel
                  </Link>
                )}
                <Link href="/leaderboard" className="block px-4 py-2 text-sm text-text-secondary" onClick={() => setMenuOpen(false)}>
                  Leaderboard
                </Link>
                <button
                  type="button"
                  onClick={() => { handleLogout(); setMenuOpen(false); }}
                  className="mt-2 rounded-full border border-red-800/50 px-4 py-2 text-sm text-red-400"
                >
                  Logout
                </button>
              </>
            ) : (
              <Link
                href="/auth/login"
                className="btn-secondary text-center text-sm"
                onClick={() => setMenuOpen(false)}
              >
                Sign in
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
