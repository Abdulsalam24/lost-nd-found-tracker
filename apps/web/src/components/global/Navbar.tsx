"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { useTheme } from "@/lib/ThemeProvider";

const NAV_LINKS = [
  {
    href: "/",
    label: "Home",
    outline:
      "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6",
    filled:
      "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6",
  },
  {
    href: "/items",
    label: "Browse",
    outline: "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z",
    filled: "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z",
  },
  null as any, // placeholder — swapped dynamically based on auth state
  {
    href: "/heatmap",
    label: "Map",
    outline:
      "M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z",
    filled:
      "M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z",
  },
  {
    href: "/games",
    label: "Games",
    outline:
      "M15 5v2m0 4v2m0 4v2M5 9a2 2 0 012-2h10a2 2 0 012 2v6a2 2 0 01-2 2H7a2 2 0 01-2-2V9zm4 3h.01M15 12h.01",
    filled:
      "M15 5v2m0 4v2m0 4v2M5 9a2 2 0 012-2h10a2 2 0 012 2v6a2 2 0 01-2 2H7a2 2 0 01-2-2V9zm4 3h.01M15 12h.01",
  },
];

const MESSAGES_LINK = {
  href: "/chat",
  label: "Messages",
  outline: "M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z",
  filled: "M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z",
};

const STATS_LINK = {
  href: "/stats",
  label: "Stats",
  outline: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z",
  filled: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z",
};

export function Navbar() {
  const { user, logout, loading } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [profileOpen, setProfileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const mobileProfileRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const router = useRouter();

  const navLinks = NAV_LINKS.map((link) => link ?? (user ? MESSAGES_LINK : STATS_LINK));

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        profileRef.current &&
        !profileRef.current.contains(e.target as Node) &&
        mobileProfileRef.current &&
        !mobileProfileRef.current.contains(e.target as Node)
      ) {
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
      <header
        className={`sticky top-0 left-0 right-0 z-30 transition-all duration-300 ${
          scrolled
            ? "bg-bg/80 backdrop-blur-xl border-b border-border/50"
            : "bg-transparent"
        }`}
      >
        <nav
          className='mx-auto flex max-w-[1440px] items-center justify-between px-5 py-5 md:px-10'
          aria-label='Main navigation'
        >
          <Link
            href='/'
            className='font-heading text-xl font-bold tracking-tight text-text'
          >
            Lost & Found
          </Link>

          <div className='hidden items-center gap-6 md:flex'>
            {navLinks.map((link) => (
              <Link
                key={link.href}
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
                    className='absolute bottom-0 left-0 h-0.5 w-full rounded-full bg-accent'
                    aria-hidden='true'
                  />
                )}
              </Link>
            ))}

            <span className='h-4 w-px bg-border-light' aria-hidden='true' />
            <button
              type='button'
              onClick={toggleTheme}
              className='flex h-9 w-9 items-center justify-center rounded-full border border-border-light text-text-muted transition-colors hover:bg-bg-hover hover:text-text'
              aria-label={`Switch to ${
                theme === "dark" ? "light" : "dark"
              } mode`}
            >
              {theme === "dark" ? (
                <svg
                  className='h-4 w-4'
                  fill='none'
                  viewBox='0 0 24 24'
                  stroke='currentColor'
                  aria-hidden='true'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z'
                  />
                </svg>
              ) : (
                <svg
                  className='h-4 w-4'
                  fill='none'
                  viewBox='0 0 24 24'
                  stroke='currentColor'
                  aria-hidden='true'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z'
                  />
                </svg>
              )}
            </button>

            {loading ? null : user ? (
              <div className='relative' ref={profileRef}>
                <button
                  type='button'
                  onClick={() => setProfileOpen(!profileOpen)}
                  className='flex items-center gap-2 rounded-full border border-border-light px-3 py-1.5 text-xs font-medium text-text transition-colors hover:bg-bg-hover hover:border-accent/30'
                >
                  <span className='flex h-7 w-7 items-center justify-center rounded-full bg-accent text-xs font-bold text-bg'>
                    {(user.name ?? "?").charAt(0).toUpperCase()}
                  </span>
                  <span className='max-w-[120px] truncate'>
                    {user.name ?? "_"}
                  </span>
                  <svg
                    className={`h-4 w-4 text-text-muted transition-transform ${
                      profileOpen ? "rotate-180" : ""
                    }`}
                    fill='none'
                    viewBox='0 0 24 24'
                    stroke='currentColor'
                    aria-hidden='true'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M19 9l-7 7-7-7'
                    />
                  </svg>
                </button>

                {profileOpen && (
                  <div className='absolute right-0 mt-2 w-56 overflow-hidden rounded-xl border border-white/10 bg-bg-card backdrop-blur-xl shadow-2xl shadow-black/50 animate-fade-in'>
                    <div className='border-b border-border px-4 py-3'>
                      <p className='text-sm font-semibold text-text truncate'>
                        {user.name ?? "_"}
                      </p>
                      <p className='text-xs text-text-secondary truncate'>
                        {user.email ?? "_"}
                      </p>
                    </div>
                    <div className='py-1'>
                      <Link
                        href='/profile'
                        className='flex items-center gap-2 px-4 py-2.5 text-[13px] text-text transition-colors hover:bg-white/5'
                        onClick={() => setProfileOpen(false)}
                      >
                        My Profile
                      </Link>
                      <Link
                        href='/claims'
                        className='flex items-center gap-2 px-4 py-2.5 text-[13px] text-text transition-colors hover:bg-white/5'
                        onClick={() => setProfileOpen(false)}
                      >
                        My Claims
                      </Link>
                      <Link
                        href='/chat'
                        className='flex items-center gap-2 px-4 py-2.5 text-[13px] text-text transition-colors hover:bg-white/5'
                        onClick={() => setProfileOpen(false)}
                      >
                        Messages
                      </Link>
                      {user.role === "admin" && (
                        <Link
                          href='/admin'
                          className='flex items-center gap-2 px-4 py-2.5 text-[13px] text-text transition-colors hover:bg-white/5'
                          onClick={() => setProfileOpen(false)}
                        >
                          Admin Panel
                        </Link>
                      )}
                      <Link
                        href='/leaderboard'
                        className='flex items-center gap-2 px-4 py-2.5 text-[13px] text-text transition-colors hover:bg-white/5'
                        onClick={() => setProfileOpen(false)}
                      >
                        Leaderboard
                      </Link>
                    </div>
                    <div className='border-t border-border py-1'>
                      <button
                        type='button'
                        onClick={handleLogout}
                        className='flex w-full items-center gap-2 px-4 py-2 text-xs text-red-400 transition-colors hover:bg-red-950/30'
                      >
                        Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href='/auth/login'
                className='text-xs font-medium text-text-secondary transition-colors hover:text-text'
              >
                Sign in
              </Link>
            )}
          </div>

          {/* Mobile: just logo + sign in / avatar */}
          <div className='flex items-center gap-2 md:hidden'>
            <button
              type='button'
              onClick={toggleTheme}
              className='flex h-8 w-8 items-center justify-center rounded-full border border-border-light text-text-muted transition-colors hover:bg-bg-hover hover:text-text'
              aria-label={`Switch to ${
                theme === "dark" ? "light" : "dark"
              } mode`}
            >
              {theme === "dark" ? (
                <svg
                  className='h-3.5 w-3.5'
                  fill='none'
                  viewBox='0 0 24 24'
                  stroke='currentColor'
                  aria-hidden='true'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z'
                  />
                </svg>
              ) : (
                <svg
                  className='h-3.5 w-3.5'
                  fill='none'
                  viewBox='0 0 24 24'
                  stroke='currentColor'
                  aria-hidden='true'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z'
                  />
                </svg>
              )}
            </button>
            {loading ? null : user ? (
              <div className='relative' ref={mobileProfileRef}>
                <button
                  type='button'
                  onClick={() => setProfileOpen(!profileOpen)}
                  className='flex items-center gap-1 rounded-full border border-border-light py-1 pl-1 pr-2'
                >
                  <span className='flex h-7 w-7 items-center justify-center rounded-full bg-accent text-xs font-bold text-bg'>
                    {(user.name ?? "?").charAt(0).toUpperCase()}
                  </span>
                  <svg
                    className={`h-3.5 w-3.5 text-text-muted transition-transform ${
                      profileOpen ? "rotate-180" : ""
                    }`}
                    fill='none'
                    viewBox='0 0 24 24'
                    stroke='currentColor'
                    aria-hidden='true'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M19 9l-7 7-7-7'
                    />
                  </svg>
                </button>

                {profileOpen && (
                  <div className='absolute right-0 mt-2 w-56 overflow-hidden rounded-xl border border-white/10 bg-bg-card backdrop-blur-xl shadow-2xl shadow-black/50 animate-fade-in z-50'>
                    <div className='border-b border-border px-4 py-3'>
                      <p className='text-sm font-semibold text-text truncate'>
                        {user.name ?? "_"}
                      </p>
                      <p className='text-xs text-text-secondary truncate'>
                        {user.email ?? "_"}
                      </p>
                    </div>
                    <div className='py-1'>
                      <Link
                        href='/profile'
                        className='flex items-center gap-2 px-4 py-2.5 text-[13px] text-text transition-colors hover:bg-white/5'
                        onClick={() => setProfileOpen(false)}
                      >
                        My Profile
                      </Link>
                      <Link
                        href='/claims'
                        className='flex items-center gap-2 px-4 py-2.5 text-[13px] text-text transition-colors hover:bg-white/5'
                        onClick={() => setProfileOpen(false)}
                      >
                        My Claims
                      </Link>
                      <Link
                        href='/chat'
                        className='flex items-center gap-2 px-4 py-2.5 text-[13px] text-text transition-colors hover:bg-white/5'
                        onClick={() => setProfileOpen(false)}
                      >
                        Messages
                      </Link>
                      {user.role === "admin" && (
                        <Link
                          href='/admin'
                          className='flex items-center gap-2 px-4 py-2.5 text-[13px] text-text transition-colors hover:bg-white/5'
                          onClick={() => setProfileOpen(false)}
                        >
                          Admin Panel
                        </Link>
                      )}
                      <Link
                        href='/leaderboard'
                        className='flex items-center gap-2 px-4 py-2.5 text-[13px] text-text transition-colors hover:bg-white/5'
                        onClick={() => setProfileOpen(false)}
                      >
                        Leaderboard
                      </Link>
                    </div>
                    <div className='border-t border-border py-1'>
                      <button
                        type='button'
                        onClick={handleLogout}
                        className='flex w-full items-center gap-2 px-4 py-2 text-xs text-red-400 transition-colors hover:bg-red-950/30'
                      >
                        Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href='/auth/login'
                className='rounded-full bg-accent px-4 py-1.5 text-[11px] font-semibold text-bg transition-colors hover:bg-accent-light'
              >
                Sign in
              </Link>
            )}
          </div>
        </nav>
      </header>

      {/* Mobile bottom floating nav */}
      {!pathname.startsWith("/admin") && !pathname.startsWith("/auth") && (
        <nav
          className='fixed bottom-2 left-1/2 z-50 w-[calc(100%-2rem)] -translate-x-1/2 md:hidden'
          aria-label='Mobile navigation'
        >
          <div className='overflow-x-auto scrollbar-none rounded-full border border-border/40 bg-bg shadow-xl shadow-black/10 dark:border-white/10 dark:bg-[rgba(30,38,30,0.85)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.5),inset_0_0.5px_0_rgba(255,255,255,0.1)] dark:backdrop-blur-xl'>
            <div className='flex items-center justify-between gap-0.5 px-1.5 py-1.5'>
              {navLinks.map((link) => {
                const active = isActive(link.href);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className='group flex shrink-0 flex-col items-center px-2 py-1 active:scale-90 transition-transform'
                  >
                    <div
                      className={`relative flex h-7 w-7 items-center justify-center transition-transform duration-300 ${
                        active
                          ? "animate-nav-bounce"
                          : "group-hover:scale-110 group-active:scale-90"
                      }`}
                    >
                      <svg
                        className={`h-[20px] w-[20px] transition-all duration-300 ${
                          active
                            ? "text-accent"
                            : "dark:text-text text-text-secondary  group-hover:text-text"
                        }`}
                        fill='none'
                        viewBox='0 0 24 24'
                        stroke='currentColor'
                        strokeWidth={active ? 2.5 : 1.8}
                        aria-hidden='true'
                      >
                        <path
                          strokeLinecap='round'
                          strokeLinejoin='round'
                          d={active ? link.filled : link.outline}
                        />
                      </svg>
                    </div>
                    <span
                      className={`text-[9px] font-black transition-colors ${
                        active
                          ? "text-accent"
                          : "text-text text-text-secondary  "
                      }`}
                    >
                      {link.label}
                    </span>
                    {active && (
                      <span
                        className='mt-0.5 h-[3px] w-3 rounded-full bg-accent'
                        aria-hidden='true'
                      />
                    )}
                    {!active && (
                      <span className='mt-0.5 h-[3px] w-3' aria-hidden='true' />
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        </nav>
      )}
    </>
  );
}
