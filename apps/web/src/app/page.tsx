"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import axios from "axios";
import { ScanningHero } from "@/components/ScanningHero";

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
    axios.get<{ data: ItemResponse[] }>(`${API_BASE}/items?limit=12`)
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
        {/* Top content */}
        <div className="flex flex-col items-center px-4 pt-28 sm:pt-32">
          {/* Counter pill */}
          <div className="mb-6 flex items-center gap-2 rounded-full border border-border-light bg-bg-card/80 px-5 py-2 backdrop-blur-sm">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-accent" />
            </span>
            <span className="text-xs text-text-secondary">
              {stats.total_items ?? 0} items reported on campus
            </span>
          </div>

          {/* Main heading */}
          <h1 className="max-w-4xl text-center text-4xl font-bold leading-[1.1] tracking-tight text-text sm:text-5xl lg:text-6xl">
            Find what you&apos;ve lost, return what you&apos;ve found
          </h1>

          {/* Subtitle */}
          <p className="mt-5 text-center text-xs tracking-[0.3em] uppercase text-text-ghost">
            &mdash; Campus &mdash; Community &mdash; Recovery &mdash;
          </p>

          {/* CTA buttons */}
          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Link href="/items/report-lost" className="btn-primary px-8 py-3">
            Report Lost Item
          </Link>
          <Link href="/items/report-found" className="btn-secondary px-8 py-3">
            Report Found Item
          </Link>
          </div>
        </div>

        {/* Floating item cards */}
        {/* <ScanningHero items={items} /> */}
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
      <section className="relative z-10 mx-auto max-w-7xl px-4 py-20">
        <div className="flex items-center justify-between">
          <h2 className="section-title">Recently Found</h2>
          <Link href="/items?type=FOUND" className="text-xs font-semibold text-accent hover:text-accent-light transition-colors">
            View all
          </Link>
        </div>
        {items.length > 0 ? (
          <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {items.map((item) => (
              <Link key={item.id} href={`/items/${item.id}`} className="card-hover group overflow-hidden">
                <div className="aspect-[4/3] overflow-hidden bg-bg-elevated">
                  {item.image_url ? (
                    <img
                      src={item.image_url}
                      alt={item.title ?? "_"}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      loading="lazy"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <svg className="h-12 w-12 text-text-ghost" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <div className="mb-2 flex items-center gap-2">
                    <span className={`text-xs font-bold uppercase tracking-wider ${item.type === "LOST" ? "text-red-400" : "text-accent"}`}>
                      {item.type ?? "_"}
                    </span>
                    <span className="badge-gray text-[10px]">{item.category ?? "_"}</span>
                  </div>
                  <h3 className="text-xs font-semibold text-text transition-colors group-hover:text-accent line-clamp-1">
                    {item.title ?? "_"}
                  </h3>
                  <p className="mt-1 flex items-center gap-1 text-xs text-text-muted">
                    <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {item.location_id ?? "_"}
                  </p>
                  <div className="mt-3 flex items-center justify-between">
                    <span className="badge-accent text-[10px]">{item.status ?? "_"}</span>
                    <time className="text-xs text-text-ghost" dateTime={item.date_of_event}>
                      {item.date_of_event ? new Date(item.date_of_event).toLocaleDateString() : "_"}
                    </time>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <p className="mt-8 text-center text-text-muted">No items found yet. Be the first to report!</p>
        )}
      </section>

      <div className="mx-auto max-w-7xl border-t border-border" />

      {/* Games Teaser */}
      <section className="relative z-10 mx-auto max-w-5xl px-4 py-20">
        <div className="text-center">
          <h2 className="section-title">Campus Games Hub</h2>
          <p className="section-subtitle mx-auto mt-2">
            Play detective games, hunt for ghost items, and test your campus knowledge.
          </p>
        </div>
        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-3">
          <GameTeaser
            title="Detective Mode"
            description="Match lost items with found reports"
            href="/games/detective"
            icon="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
          <GameTeaser
            title="Ghost Items"
            description="Find items that were never claimed"
            href="/games/ghost-hunt"
            icon="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
          <GameTeaser
            title="Campus Quiz"
            description="Test your knowledge of campus locations"
            href="/games/trivia"
            icon="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
          />
        </div>
        <div className="mt-8 text-center">
          <Link href="/games" className="btn-primary rounded-full px-8 py-3">
            Explore Games
          </Link>
        </div>
      </section>
    </div>
  );
}

function GameTeaser({ title, description, href, icon }: { title: string; description: string; href: string; icon: string }) {
  return (
    <Link href={href} className="card-hover group flex flex-col overflow-hidden">
      <div className="flex h-36 items-center justify-center bg-bg-elevated">
        <svg className="h-10 w-10 text-accent transition-transform duration-300 group-hover:scale-110" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={icon} />
        </svg>
      </div>
      <div className="flex flex-1 flex-col p-5">
        <h3 className="text-lg font-semibold text-text">{title}</h3>
        <p className="mt-1 flex-1 text-xs text-text-muted">{description}</p>
        <div className="mt-4">
          <span className="text-xs font-semibold text-accent group-hover:text-accent-light transition-colors">
            Play Now &rarr;
          </span>
        </div>
      </div>
    </Link>
  );
}
