"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { useTheme } from "@/lib/ThemeProvider";

const NAV_LINKS = [
  { href: "/", label: "Home", icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" },
  { href: "/items", label: "Browse", icon: "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" },
  { href: "/stats", label: "Stats", icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" },
  { href: "/heatmap", label: "Heatmap", icon: "M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" },
  { href: "/games", label: "Games", icon: "M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" },
];

const AUTH_NAV_LINKS = [
  { href: "/chat", label: "Messages", icon: "M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" },
];

export function Navbar() {
  const { user, logout, loading } = useAuth();
  const { theme, toggleTheme } = useTheme();
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
    <>
      {/* Desktop top nav */}
      <header className="absolute top-0 left-0 right-0 z-30">
        <nav
          className="flex items-center justify-between pl-5 md:pl-10 pr-5 md:pr-20 py-5"
          aria-label="Main navigation"
        >
          <Link
            href="/"
            className="font-heading text-xl font-bold tracking-tight text-text"
          >
            Lost & Found
          </Link>

          <ul className="hidden items-center gap-8 md:flex">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={`relative pb-1 text-xs font-medium transition-colors ${
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
            {user && AUTH_NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-full px-4 py-1.5 text-xs font-medium transition-colors ${
                  isActive(link.href)
                    ? "bg-white/10 text-text"
                    : "text-text-muted hover:bg-white/5 hover:text-text"
                }`}
              >
                {link.label}
              </Link>
            ))}
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
                  className="flex items-center gap-2 rounded-full border border-border-light px-3 py-1.5 text-xs font-medium text-text transition-colors hover:bg-bg-hover hover:border-accent/30"
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
                      <p className="text-xs font-semibold text-text">{user.name ?? "_"}</p>
                      <p className="text-xs text-text-muted">{user.email ?? "_"}</p>
                    </div>
                    <div className="py-1">
                      <Link href="/profile" className="flex items-center gap-2 px-4 py-2 text-xs text-text-secondary transition-colors hover:bg-bg-hover hover:text-text" onClick={() => setProfileOpen(false)}>
                        My Profile
                      </Link>
                      <Link href="/claims" className="flex items-center gap-2 px-4 py-2 text-xs text-text-secondary transition-colors hover:bg-bg-hover hover:text-text" onClick={() => setProfileOpen(false)}>
                        My Claims
                      </Link>
                      <Link href="/chat" className="flex items-center gap-2 px-4 py-2 text-xs text-text-secondary transition-colors hover:bg-bg-hover hover:text-text" onClick={() => setProfileOpen(false)}>
                        Messages
                      </Link>
                      {user.role === "admin" && (
                        <Link href="/admin" className="flex items-center gap-2 px-4 py-2 text-xs text-text-secondary transition-colors hover:bg-bg-hover hover:text-text" onClick={() => setProfileOpen(false)}>
                          Admin Panel
                        </Link>
                      )}
                      <Link href="/leaderboard" className="flex items-center gap-2 px-4 py-2 text-xs text-text-secondary transition-colors hover:bg-bg-hover hover:text-text" onClick={() => setProfileOpen(false)}>
                        Leaderboard
                      </Link>
                    </div>
                    <div className="border-t border-border py-1">
                      <button
                        type="button"
                        onClick={handleLogout}
                        className="flex w-full items-center gap-2 px-4 py-2 text-xs text-red-400 transition-colors hover:bg-red-950/30"
                      >
                        Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link href="/auth/login" className="text-xs font-medium text-text-secondary transition-colors hover:text-text">
                Sign in
              </Link>
            )}
          </div>

          {/* Mobile: just logo + sign in / avatar */}
          <div className="flex items-center gap-2 md:hidden">
            <button
              type="button"
              onClick={toggleTheme}
              className="flex h-8 w-8 items-center justify-center rounded-full border border-border-light text-text-muted transition-colors hover:bg-bg-hover hover:text-text"
              aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
            >
              {theme === "dark" ? (
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              ) : (
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </button>
            {loading ? null : user ? (
              <Link href="/profile" className="flex h-8 w-8 items-center justify-center rounded-full bg-accent text-xs font-bold text-bg">
                {(user.name ?? "?").charAt(0).toUpperCase()}
              </Link>
            ) : (
              <Link href="/auth/login" className="rounded-full bg-accent px-4 py-1.5 text-[11px] font-semibold text-bg transition-colors hover:bg-accent-light">
                Sign in
              </Link>
            )}
          </div>
        </nav>
      </header>

      {/* Mobile bottom pill nav — hidden on admin & chat */}
      {!pathname.startsWith("/admin") && !pathname.startsWith("/chat") && (
      <nav
        className="fixed bottom-5 left-1/2 z-50 -translate-x-1/2 md:hidden"
        aria-label="Mobile navigation"
      >
        <div className="flex items-center gap-1 rounded-full border border-white/[0.08] bg-black/40 px-2 py-1.5 shadow-2xl shadow-black/50 backdrop-blur-2xl backdrop-saturate-150">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`flex flex-col items-center gap-0.5 rounded-full px-4 py-1.5 transition-all ${
                isActive(link.href)
                  ? "bg-white/10 text-white"
                  : "text-text-ghost hover:text-text-secondary"
              }`}
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={link.icon} />
              </svg>
              <span className="text-[9px] font-medium">{link.label}</span>
            </Link>
          ))}
        </div>
      </nav>
      )}
    </>
  );
}
