"use client";

import { useEffect, useState } from "react";

interface FloatingItem {
  id: string;
  title: string;
  category: string;
  location_id: string;
  image_url?: string;
  type: string;
}

interface FloatingItemsProps {
  items: FloatingItem[];
}

const POSITIONS = [
  { left: "8%", top: "30%", delay: "0s" },
  { left: "5%", top: "55%", delay: "1s" },
  { left: "15%", top: "75%", delay: "2.5s" },
  { right: "8%", top: "25%", delay: "0.5s" },
  { right: "5%", top: "50%", delay: "1.5s" },
  { right: "12%", top: "72%", delay: "3s" },
  { left: "25%", top: "65%", delay: "2s" },
  { right: "25%", top: "68%", delay: "3.5s" },
];

export function FloatingItems({ items }: FloatingItemsProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 800);
    return () => clearTimeout(timer);
  }, []);

  if (items.length === 0) return null;

  const displayItems = items.slice(0, Math.min(items.length, POSITIONS.length));

  return (
    <div className="pointer-events-none absolute inset-0 hidden overflow-hidden lg:block" aria-hidden="true">
      {displayItems.map((item, i) => {
        const pos = POSITIONS[i];
        return (
          <div
            key={item.id}
            className="absolute transition-all duration-1000 ease-out"
            style={{
              left: pos.left,
              right: pos.right,
              top: pos.top,
              opacity: visible ? 1 : 0,
              transform: visible ? "translateY(0)" : "translateY(30px)",
              transitionDelay: pos.delay,
              animation: `float 6s ease-in-out ${pos.delay} infinite`,
            }}
          >
            <div className="w-36 overflow-hidden rounded-xl border border-border-light bg-bg-card/90 shadow-lg shadow-black/30 backdrop-blur-sm">
              <div className="relative aspect-square overflow-hidden bg-bg-elevated">
                {item.image_url ? (
                  <img
                    src={item.image_url}
                    alt=""
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <svg className="h-8 w-8 text-text-ghost" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                  </div>
                )}
                {/* Location badge */}
                <div className="absolute left-2 top-2 flex items-center gap-1 rounded-full bg-bg/80 px-2 py-0.5 backdrop-blur-sm">
                  <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                  <span className="text-[10px] text-text-secondary">{item.location_id ?? "_"}</span>
                </div>
              </div>
              <div className="p-2.5">
                <p className="text-xs font-semibold text-text line-clamp-1">{item.title ?? "_"}</p>
                <p className="text-[10px] text-text-muted">{item.category ?? "_"}</p>
                <div className="mt-1.5">
                  <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${
                    item.type === "LOST"
                      ? "bg-red-950/50 text-red-400"
                      : "bg-accent/10 text-accent"
                  }`}>
                    {item.type === "LOST" ? "Lost" : "Found"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
