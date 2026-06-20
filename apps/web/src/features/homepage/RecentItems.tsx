"use client";

import Link from "next/link";
import { ItemCard } from "@/components/items/ItemCard";
import { SkeletonCard } from "@/components/ui/Skeleton";

interface ItemResponse {
  id: string;
  title: string;
  type: string;
  category: string;
  status: string;
  location_id: string;
  location?: { id: string; name: string } | null;
  date_of_event: string;
  image_url?: string;
  reporter?: { id: string; name: string } | null;
}

interface RecentItemsProps {
  items: ItemResponse[];
  loading?: boolean;
}

export function RecentItems({ items, loading = false }: RecentItemsProps) {
  return (
    <section className="relative z-10 mx-auto max-w-5xl px-4 py-8 sm:py-14">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-text sm:text-xl">Recently Found</h2>
        <Link href="/items?type=FOUND" className="text-[11px] font-semibold text-accent hover:text-accent-light transition-colors">
          View all &rarr;
        </Link>
      </div>
      {loading ? (
        <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : items.length > 0 ? (
        <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3 lg:grid-cols-4">
          {items.map((item) => (
            <ItemCard key={item.id} {...item} compact />
          ))}
        </div>
      ) : (
        <div className="mt-8 flex flex-col items-center py-6">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-accent/10">
            <svg className="h-7 w-7 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
          <p className="mt-3 text-sm font-semibold text-text">No items found yet</p>
          <p className="mt-1 text-xs text-text-muted">Be the first to report!</p>
        </div>
      )}
    </section>
  );
}
