"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import axios from "axios";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3002";

interface ItemResponse {
  id: string;
  title: string;
  type: string;
  category: string;
  status: string;
  location_id: string;
  date_of_event: string;
  image_url?: string;
}

interface StatsResponse {
  total_items: number;
  total_recovered: number;
  recovery_rate: number;
}

export default function HomePage() {
  const [items, setItems] = useState<ItemResponse[]>([]);
  const [stats, setStats] = useState<StatsResponse>({ total_items: 0, total_recovered: 0, recovery_rate: 0 });

  useEffect(() => {
    axios.get<{ data: ItemResponse[] }>(`${API_BASE}/items?limit=8`)
      .then((res) => setItems(res.data.data ?? []))
      .catch(() => {});
    axios.get<StatsResponse>(`${API_BASE}/stats`)
      .then((res) => setStats(res.data))
      .catch(() => {});
  }, []);

  return (
    <div className="relative">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="flex flex-col items-center px-4 pt-28 sm:pt-32">
          <div className="mb-6 flex items-center gap-2 rounded-full border border-border-light bg-bg-card/80 px-5 py-2 backdrop-blur-sm">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-accent" />
            </span>
            <span className="text-xs text-text-secondary">
              {stats.total_items ?? 0} items reported on campus
            </span>
          </div>

          <h1 className="max-w-4xl text-center text-4xl font-bold leading-[1.1] tracking-tight text-text sm:text-5xl lg:text-6xl">
            Find what you&apos;ve lost, return what you&apos;ve found
          </h1>

          <p className="mt-5 text-center text-xs tracking-[0.3em] uppercase text-text-ghost">
            &mdash; Campus &mdash; Community &mdash; Recovery &mdash;
          </p>

          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Link href="/items/report-lost" className="btn-primary px-8 py-3">
              Report Lost Item
            </Link>
            <Link href="/items/report-found" className="btn-secondary px-8 py-3">
              Report Found Item
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="relative z-10 mx-auto max-w-lg px-4 py-6 sm:max-w-3xl sm:py-10">
        <div className="card flex items-center divide-x divide-border rounded-xl sm:rounded-2xl">
          <div className="flex-1 py-3 text-center sm:py-5">
            <p className="text-lg font-bold text-text sm:text-3xl">{stats.total_items ?? "_"}</p>
            <p className="mt-0.5 text-[8px] font-semibold uppercase tracking-wider text-text-muted sm:mt-1 sm:text-[10px]">Reported</p>
          </div>
          <div className="flex-1 py-3 text-center sm:py-5">
            <p className="text-lg font-bold text-text sm:text-3xl">{stats.total_recovered ?? "_"}</p>
            <p className="mt-0.5 text-[8px] font-semibold uppercase tracking-wider text-text-muted sm:mt-1 sm:text-[10px]">Recovered</p>
          </div>
          <div className="flex-1 py-3 text-center sm:py-5">
            <p className="text-lg font-bold text-accent sm:text-3xl">{`${stats.recovery_rate ?? 0}%`}</p>
            <p className="mt-0.5 text-[8px] font-semibold uppercase tracking-wider text-text-muted sm:mt-1 sm:text-[10px]">Recovery Rate</p>
          </div>
        </div>
      </section>

      {/* Recently Found Items */}
      <section className="relative z-10 mx-auto max-w-6xl px-4 py-10 sm:py-16">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-text sm:text-2xl">Recently Found</h2>
          <Link href="/items?type=FOUND" className="text-xs font-semibold text-accent hover:text-accent-light transition-colors">
            View all &rarr;
          </Link>
        </div>
        {items.length > 0 ? (
          <div className="mt-6 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
            {items.map((item) => (
              <Link key={item.id} href={`/items/${item.id}`} className="card-hover group overflow-hidden rounded-xl">
                <div className="relative aspect-square overflow-hidden bg-bg-elevated">
                  {item.image_url ? (
                    <Image
                      src={item.image_url}
                      alt={item.title ?? "_"}
                      fill
                      sizes="(max-width: 640px) 50vw, 25vw"
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <svg className="h-8 w-8 text-text-ghost" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  )}
                  <span className={`absolute top-2 left-2 rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide backdrop-blur-md ${
                    item.type === "LOST"
                      ? "bg-red-500/80 text-white"
                      : "bg-accent/80 text-bg"
                  }`}>
                    {item.type ?? "_"}
                  </span>
                </div>
                <div className="p-2.5 sm:p-3">
                  <h3 className="text-[11px] font-semibold text-text transition-colors group-hover:text-accent line-clamp-1 sm:text-xs">
                    {item.title ?? "_"}
                  </h3>
                  <div className="mt-1 flex items-center justify-between">
                    <span className="text-[9px] text-text-ghost sm:text-[10px]">{item.category ?? "_"}</span>
                    <time className="text-[9px] text-text-ghost sm:text-[10px]" dateTime={item.date_of_event}>
                      {item.date_of_event ? new Date(item.date_of_event).toLocaleDateString(undefined, { month: "short", day: "numeric" }) : "_"}
                    </time>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <p className="mt-8 text-center text-xs text-text-muted">No items found yet. Be the first to report!</p>
        )}
      </section>

      <div className="mx-auto max-w-6xl border-t border-border" />

      {/* Games Teaser */}
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
          <GameTeaser
            title="Detective"
            description="Rank categories"
            href="/games/detective"
            icon="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            color="emerald"
          />
          <GameTeaser
            title="Ghost Hunt"
            description="Find hidden items"
            href="/games/ghost-hunt"
            icon="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            color="amber"
          />
          <GameTeaser
            title="Trivia"
            description="Campus quiz"
            href="/games/trivia"
            icon="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
            color="purple"
          />
        </div>
      </section>
    </div>
  );
}

const GAME_COLORS = {
  emerald: { bg: "bg-emerald-500/10", icon: "text-emerald-400", ring: "group-hover:ring-emerald-500/20" },
  amber: { bg: "bg-amber-500/10", icon: "text-amber-400", ring: "group-hover:ring-amber-500/20" },
  purple: { bg: "bg-purple-500/10", icon: "text-purple-400", ring: "group-hover:ring-purple-500/20" },
};

function GameTeaser({ title, description, href, icon, color }: { title: string; description: string; href: string; icon: string; color: keyof typeof GAME_COLORS }) {
  const c = GAME_COLORS[color];
  return (
    <Link href={href} className={`card group flex flex-col items-center rounded-xl p-4 text-center transition-all hover:shadow-lg sm:p-6 ring-1 ring-transparent ${c.ring}`}>
      <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${c.bg} sm:h-14 sm:w-14 sm:rounded-2xl`}>
        <svg className={`h-5 w-5 sm:h-6 sm:w-6 ${c.icon} transition-transform duration-300 group-hover:scale-110`} fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={icon} />
        </svg>
      </div>
      <h3 className="mt-3 text-xs font-semibold text-text sm:text-sm">{title}</h3>
      <p className="mt-0.5 text-[9px] text-text-muted sm:text-[11px]">{description}</p>
    </Link>
  );
}
