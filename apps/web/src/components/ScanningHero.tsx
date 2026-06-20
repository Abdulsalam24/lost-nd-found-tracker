"use client";

import { useMemo } from "react";
import Link from "next/link";

interface ItemCard {
  id: string;
  title: string;
  type: string;
  category?: string;
  image_url?: string;
  location_id?: string;
}

interface Props {
  items?: ItemCard[];
}

const FALLBACK_CARDS: ItemCard[] = [
  { id: "1", title: "Student ID Card", type: "LOST", category: "ID Cards", location_id: "Senate Building" },
  { id: "2", title: "Backpack", type: "LOST", category: "Bags", location_id: "Main Library" },
  { id: "3", title: "Calculator", type: "FOUND", category: "Electronics", location_id: "Faculty of Science" },
  { id: "4", title: "Power Bank", type: "LOST", category: "Electronics", location_id: "SUB Building" },
  { id: "5", title: "Textbook", type: "FOUND", category: "Books", location_id: "Faculty of Arts" },
  { id: "6", title: "Headphones", type: "LOST", category: "Electronics", location_id: "Student Centre" },
  { id: "7", title: "Water Bottle", type: "FOUND", category: "Other", location_id: "Stadium" },
  { id: "8", title: "Wallet", type: "LOST", category: "Other", location_id: "Cafeteria" },
  { id: "9", title: "Lab Coat", type: "LOST", category: "Clothing", location_id: "Faculty of Science" },
];

function ItemCardEl({ card }: { card: ItemCard }) {
  return (
    <Link
      href={card.id.length > 5 ? `/items/${card.id}` : "/items"}
      className="group/card relative block w-[180px] flex-shrink-0 sm:w-[200px]"
    >
      {/* Tooltip */}
      <div className="pointer-events-none absolute -top-10 left-1/2 z-20 -translate-x-1/2 whitespace-nowrap rounded-lg bg-[#2a2a2a] px-3 py-1.5 text-[11px] font-medium text-white opacity-0 shadow-lg transition-all duration-200 group-hover/card:opacity-100 group-hover/card:-top-12">
        {card.title}
        <div className="absolute left-1/2 top-full -translate-x-1/2 border-4 border-transparent border-t-[#2a2a2a]" />
      </div>
      <div className="overflow-hidden rounded-2xl border border-border-light bg-bg-card/90 shadow-lg shadow-black/20 backdrop-blur-md transition-transform duration-300 hover:scale-[1.03] hover:shadow-xl">
        {card.image_url ? (
          <div className="relative aspect-[3/4] overflow-hidden bg-bg-elevated">
            <img
              src={card.image_url}
              alt={card.title}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
            />
            <div className="absolute left-2 top-2 flex items-center gap-1.5 rounded-full bg-bg/70 px-2 py-0.5 backdrop-blur-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-accent" />
              <span className="text-[10px] font-medium text-text-secondary">
                {card.location_id ?? "_"}
              </span>
            </div>
          </div>
        ) : (
          <div className="flex aspect-[3/4] items-center justify-center bg-bg-elevated">
            <svg className="h-10 w-10 text-text-ghost" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        )}
        <div className="p-2.5">
          <p className="text-xs font-semibold text-text truncate">{card.title ?? "_"}</p>
          <p className="text-[10px] text-text-muted mt-0.5">{card.category ?? "_"}</p>
          <div className="mt-1.5">
            <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-medium ${
              card.type === "LOST"
                ? "bg-red-500/10 text-red-400"
                : "bg-emerald-500/10 text-emerald-400"
            }`}>
              {card.type === "LOST" ? "Lost" : "Found"}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

export function ScanningHero({ items = [] }: Props) {
  const cards = useMemo((): ItemCard[] => {
    const source: ItemCard[] = items.length > 0 ? items : FALLBACK_CARDS;
    return [...source].sort(() => Math.random() - 0.5);
  }, [items]);

  return (
    <div className="relative mt-14 w-full overflow-hidden hero-carousel-wrap" style={{ perspective: "1200px" }}>
      {/* Side fades */}
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-[#000] to-transparent sm:w-40" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-[#000] to-transparent sm:w-40" />
      {/* Bottom fade */}
      <div className="pointer-events-none absolute bottom-0 left-0 right-0 z-10 h-20 bg-gradient-to-t from-[#000] to-transparent" />

      {/* Single curved row */}
      <div
        className="flex gap-5 py-4 hero-scroll-left"
        style={{ transformStyle: "preserve-3d", transform: "rotateX(2deg)" }}
      >
        {cards.map((card, i) => (
          <div
            key={`a-${card.id}-${i}`}
            style={{
              transform: `translateZ(${-20 + Math.sin(i * 0.7) * 30}px) translateY(${Math.sin(i * 0.8) * 20}px)`,
            }}
          >
            <ItemCardEl card={card} />
          </div>
        ))}
        {cards.map((card, i) => (
          <div
            key={`b-${card.id}-${i}`}
            style={{
              transform: `translateZ(${-20 + Math.sin(i * 0.7) * 30}px) translateY(${Math.sin(i * 0.8) * 20}px)`,
            }}
          >
            <ItemCardEl card={card} />
          </div>
        ))}
      </div>
    </div>
  );
}
