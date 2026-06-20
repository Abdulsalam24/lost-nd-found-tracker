"use client";

import Link from "next/link";
import Image from "next/image";

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
}

export function RecentItems({ items }: RecentItemsProps) {
  return (
    <section className="relative z-10 mx-auto max-w-5xl px-4 py-8 sm:py-14">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-text sm:text-xl">Recently Found</h2>
        <Link href="/items?type=FOUND" className="text-[11px] font-semibold text-accent hover:text-accent-light transition-colors">
          View all &rarr;
        </Link>
      </div>
      {items.length > 0 ? (
        <div className="mt-4 grid grid-cols-3 gap-2 sm:gap-3 lg:grid-cols-4">
          {items.map((item) => (
            <RecentItemCard key={item.id} item={item} />
          ))}
        </div>
      ) : (
        <p className="mt-8 text-center text-xs text-text-muted">No items found yet. Be the first to report!</p>
      )}
    </section>
  );
}

function RecentItemCard({ item }: { item: ItemResponse }) {
  return (
    <Link href={`/items/${item.id}`} className="card-hover group overflow-hidden rounded-lg">
      <div className="relative aspect-[4/5] overflow-hidden bg-bg-elevated">
        {item.image_url ? (
          <Image
            src={item.image_url}
            alt={item.title ?? "_"}
            fill
            sizes="(max-width: 640px) 33vw, 25vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <svg className="h-6 w-6 text-text-ghost" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}
        <span className={`absolute top-1.5 left-1.5 rounded-full px-1.5 py-px text-[7px] font-bold uppercase tracking-wide backdrop-blur-md sm:text-[8px] ${
          item.type === "LOST"
            ? "bg-red-500/80 text-white"
            : "bg-accent/80 text-bg"
        }`}>
          {item.type ?? "_"}
        </span>
      </div>
      <div className="p-2">
        <h3 className="text-[10px] font-semibold text-text transition-colors group-hover:text-accent line-clamp-1 sm:text-[11px]">
          {item.title ?? "_"}
        </h3>
        <p className="mt-0.5 text-[8px] text-text-ghost sm:text-[9px]">{item.category ?? "_"}</p>
      </div>
    </Link>
  );
}
