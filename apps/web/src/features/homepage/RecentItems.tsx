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
  date_of_event: string;
  image_url?: string;
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
        <div className="mt-4 grid grid-cols-3 gap-2 sm:gap-3 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : items.length > 0 ? (
        <div className="mt-4 grid grid-cols-3 gap-2 sm:gap-3 lg:grid-cols-4">
          {items.map((item) => (
            <ItemCard key={item.id} {...item} compact />
          ))}
        </div>
      ) : (
        <p className="mt-8 text-center text-xs text-text-muted">No items found yet. Be the first to report!</p>
      )}
    </section>
  );
}
