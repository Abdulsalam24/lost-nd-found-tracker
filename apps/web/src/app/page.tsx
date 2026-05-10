import Link from "next/link";
import { serverFetch } from "@/lib/api";
import { ItemCard } from "@/components/ItemCard";
import { GameCard } from "@/components/GameCard";

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

async function getRecentItems(): Promise<ItemResponse[]> {
  try {
    const res = await serverFetch<{ data: ItemResponse[] }>("/items?type=FOUND&limit=8&sort=created_at:desc");
    return res.data ?? [];
  } catch {
    return [];
  }
}

async function getStats(): Promise<StatsResponse> {
  try {
    return await serverFetch<StatsResponse>("/stats");
  } catch {
    return { total_items: 0, total_recovered: 0, recovery_rate: 0 };
  }
}

export default async function HomePage() {
  const [items, stats] = await Promise.all([getRecentItems(), getStats()]);

  return (
    <div className="min-h-screen bg-cream">
      {/* Hero */}
      <section className="relative px-4 py-20 sm:py-32 bg-ink">
        <div className="mx-auto max-w-4xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-kraft-light">Established 2020</p>
          <div className="mx-auto my-4 w-12 border-t border-kraft/40" />
          <h1 className="text-4xl font-bold uppercase tracking-[0.08em] text-cream sm:text-6xl lg:text-7xl">
            Lost &<br />Found
          </h1>
          <div className="mx-auto my-4 w-12 border-t border-kraft/40" />
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-kraft-light">Campus Provisions</p>
          <p className="mx-auto mt-4 max-w-xl font-script italic text-kraft-light text-lg">
            Helping you find what matters
          </p>

          <div className="mx-auto mt-10 max-w-lg">
            <form action="/items" method="get">
              <label htmlFor="hero-search" className="sr-only">Search items</label>
              <div className="flex gap-3">
                <input
                  id="hero-search"
                  name="q"
                  type="search"
                  placeholder="Search for lost or found items..."
                  className="flex-1 rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-sm text-cream placeholder:text-cream/50 focus:border-coral focus:ring-1 focus:ring-coral transition-all"
                  aria-label="Search for lost or found items"
                />
                <button type="submit" className="rounded-full bg-coral px-6 py-3 text-sm font-bold uppercase tracking-wider text-cream transition-all hover:bg-coral-dark">
                  Search
                </button>
              </div>
            </form>
          </div>

          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <Link href="/items/report-lost" className="rounded-full bg-cream px-8 py-3 text-sm font-bold uppercase tracking-wider text-ink transition-all hover:bg-cream-200">
              Report Lost Item
            </Link>
            <Link href="/items/report-found" className="rounded-full border-2 border-cream/30 px-8 py-3 text-sm font-bold uppercase tracking-wider text-cream transition-all hover:border-cream hover:bg-cream/10">
              Report Found Item
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="mx-auto max-w-5xl px-4 py-16">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          <div className="card rounded-2xl p-8 text-center">
            <p className="text-4xl font-bold text-ink">{stats.total_items ?? "_"}</p>
            <p className="mt-2 text-xs font-semibold uppercase tracking-wider text-ink-faint">Total Items Reported</p>
          </div>
          <div className="card rounded-2xl p-8 text-center">
            <p className="text-4xl font-bold text-ink">{stats.total_recovered ?? "_"}</p>
            <p className="mt-2 text-xs font-semibold uppercase tracking-wider text-ink-faint">Items Recovered</p>
          </div>
          <div className="card rounded-2xl p-8 text-center">
            <p className="text-4xl font-bold text-coral">{`${stats.recovery_rate ?? 0}%`}</p>
            <p className="mt-2 text-xs font-semibold uppercase tracking-wider text-ink-faint">Recovery Rate</p>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl border-t border-cream-300" />

      {/* Recently Found Items */}
      <section className="mx-auto max-w-7xl px-4 py-16">
        <div className="flex items-center justify-between">
          <h2 className="section-title">Recently Found Items</h2>
          <Link href="/items?type=FOUND" className="text-sm font-semibold uppercase tracking-wider text-coral hover:underline">
            View all
          </Link>
        </div>
        {items.length > 0 ? (
          <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {items.map((item) => (
              <ItemCard key={item.id} {...item} />
            ))}
          </div>
        ) : (
          <p className="mt-8 text-center text-ink-muted">No items found yet. Be the first to report!</p>
        )}
      </section>

      <div className="mx-auto max-w-7xl border-t border-cream-300" />

      {/* Games Teaser */}
      <section className="mx-auto max-w-5xl px-4 py-16">
        <div className="text-center">
          <h2 className="section-title">Campus Games Hub</h2>
          <p className="section-subtitle mx-auto mt-2">
            Play detective games, hunt for ghost items, and test your campus knowledge.
          </p>
        </div>
        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-3">
          <GameCard
            title="Detective Mode"
            description="Match lost items with found reports"
            href="/games/detective"
            icon={
              <svg className="h-10 w-10 text-coral" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            }
            color="bg-cream-200"
          />
          <GameCard
            title="Ghost Items"
            description="Find items that were never claimed"
            href="/games/ghost"
            icon={
              <svg className="h-10 w-10 text-coral" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
            color="bg-cream-200"
          />
          <GameCard
            title="Campus Quiz"
            description="Test your knowledge of campus locations"
            href="/games/quiz"
            icon={
              <svg className="h-10 w-10 text-coral" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            }
            color="bg-cream-200"
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
