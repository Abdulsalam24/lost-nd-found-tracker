"use client";

import Link from "next/link";

const GAMES = [
  { title: "Detective", description: "Rank categories", href: "/games/detective", icon: "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z", color: "emerald" as const },
  { title: "Ghost Hunt", description: "Find hidden items", href: "/games/ghost-hunt", icon: "M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z", color: "amber" as const },
  { title: "Trivia", description: "Campus quiz", href: "/games/trivia", icon: "M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z", color: "purple" as const },
];

const COLORS = {
  emerald: { bg: "bg-emerald-500/10", icon: "text-emerald-400", ring: "group-hover:ring-emerald-500/20" },
  amber: { bg: "bg-amber-500/10", icon: "text-amber-400", ring: "group-hover:ring-amber-500/20" },
  purple: { bg: "bg-purple-500/10", icon: "text-purple-400", ring: "group-hover:ring-purple-500/20" },
};

export function GamesTeaser() {
  return (
    <section className="relative z-10 mx-auto max-w-6xl px-4 py-10 sm:py-16">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-text sm:text-2xl">Campus Games</h2>
          <p className="mt-1 text-xs text-text-muted sm:text-sm">Play, compete, and earn points</p>
        </div>
        <Link href="/games" className="text-xs font-semibold text-accent hover:text-accent-light transition-colors">
          View all &rarr;
        </Link>
      </div>
      <div className="mt-6 grid grid-cols-3 gap-3 sm:gap-4">
        {GAMES.map((game) => {
          const c = COLORS[game.color];
          return (
            <Link
              key={game.href}
              href={game.href}
              className={`card group flex flex-col items-center rounded-xl p-4 text-center transition-all hover:shadow-lg sm:p-6 ring-1 ring-transparent ${c.ring}`}
            >
              <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${c.bg} sm:h-14 sm:w-14 sm:rounded-2xl`}>
                <svg className={`h-5 w-5 sm:h-6 sm:w-6 ${c.icon} transition-transform duration-300 group-hover:scale-110`} fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={game.icon} />
                </svg>
              </div>
              <h3 className="mt-3 text-xs font-semibold text-text sm:text-sm">{game.title}</h3>
              <p className="mt-0.5 text-[9px] text-text-muted sm:text-[11px]">{game.description}</p>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
