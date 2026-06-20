"use client";

import Link from "next/link";

const GAMES = [
  {
    title: "Detective",
    description: "Match lost items with found reports",
    href: "/games/detective",
    icon: "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z",
    color: { icon: "text-emerald-400", bg: "bg-emerald-500/15", border: "border-emerald-500/30" },
  },
  {
    title: "Ghost Hunt",
    description: "Find items that were never claimed",
    href: "/games/ghost-hunt",
    icon: "M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
    color: { icon: "text-amber-400", bg: "bg-amber-500/15", border: "border-amber-500/30" },
  },
  {
    title: "Trivia",
    description: "Test your campus knowledge",
    href: "/games/trivia",
    icon: "M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z",
    color: { icon: "text-purple-400", bg: "bg-purple-500/15", border: "border-purple-500/30" },
  },
];

export function GamesTeaser() {
  return (
    <section className="relative z-10 mx-auto max-w-5xl px-4 py-10 sm:py-16">
      <div>
        <h2 className="text-xl font-bold text-text sm:text-2xl">Campus games</h2>
        <p className="mt-1 text-xs text-text-muted">Hover a card to preview its icon</p>
      </div>
      <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
        {GAMES.map((game) => (
          <Link
            key={game.href}
            href={game.href}
            className="group card p-5 transition-all hover:border-border/70 hover:bg-bg-hover sm:p-6"
          >
            <div className={`inline-flex h-12 w-12 items-center justify-center rounded-xl border ${game.color.border} ${game.color.bg} transition-transform duration-300 group-hover:scale-110`}>
              <svg className={`h-5 w-5 ${game.color.icon}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={game.icon} />
              </svg>
            </div>
            <h3 className="mt-4 text-base font-semibold text-text">{game.title}</h3>
            <p className="mt-1 text-xs text-text-muted leading-relaxed">{game.description}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
