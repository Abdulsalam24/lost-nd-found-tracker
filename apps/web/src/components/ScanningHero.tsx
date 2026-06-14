"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";

const SCAN_MESSAGES = [
  "Scanning campus locations...",
  "Checking recent reports...",
  "Matching lost items...",
  "Scanning 2.5 km radius...",
  "Analyzing item patterns...",
];

interface ItemCard {
  id: string;
  title: string;
  type: string;
  image_url?: string;
  location_id?: string;
}

interface Props {
  items?: ItemCard[];
}

const FALLBACK_CARDS = [
  { id: "1", title: "Student ID Card", type: "LOST", location_id: "Senate Building" },
  { id: "2", title: "Backpack", type: "LOST", location_id: "Main Library" },
  { id: "3", title: "Calculator", type: "FOUND", location_id: "Faculty of Science" },
  { id: "4", title: "Power Bank", type: "LOST", location_id: "SUB Building" },
  { id: "5", title: "Textbook", type: "FOUND", location_id: "Faculty of Arts" },
  { id: "6", title: "Headphones", type: "LOST", location_id: "Student Centre" },
  { id: "7", title: "Water Bottle", type: "FOUND", location_id: "Stadium" },
  { id: "8", title: "Wallet", type: "LOST", location_id: "Cafeteria" },
];

const DESKTOP_POSITIONS = [
  { x: -340, y: -130 },
  { x: -300, y: 70 },
  { x: -220, y: 210 },
  { x: 0, y: -190 },
  { x: 30, y: 190 },
  { x: 340, y: -130 },
  { x: 300, y: 70 },
  { x: 220, y: 210 },
];

const MOBILE_POSITIONS = [
  { x: -85, y: -150 },
  { x: 85, y: -110 },
  { x: -75, y: 130 },
  { x: 85, y: 160 },
];

export function ScanningHero({ items = [] }: Props) {
  const [messageIndex, setMessageIndex] = useState(0);
  const [phase, setPhase] = useState<"scanning" | "found">("scanning");
  const [visibleCards, setVisibleCards] = useState<number[]>([]);

  const cards = useMemo(() => {
    const source = items.length > 0 ? items : FALLBACK_CARDS;
    const shuffled = [...source].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, DESKTOP_POSITIONS.length);
  }, [items]);

  useEffect(() => {
    const msgInterval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % SCAN_MESSAGES.length);
    }, 3000);
    return () => clearInterval(msgInterval);
  }, []);

  useEffect(() => {
    const scanTimer = setTimeout(() => setPhase("found"), 1800);
    return () => clearTimeout(scanTimer);
  }, []);

  useEffect(() => {
    if (phase !== "found") return;
    const timers: NodeJS.Timeout[] = [];
    cards.forEach((_, i) => {
      timers.push(setTimeout(() => {
        setVisibleCards((prev) => [...prev, i]);
      }, i * 200));
    });
    return () => timers.forEach(clearTimeout);
  }, [phase, cards]);

  return (
    <div className="relative mt-12 flex flex-col items-center gap-6">
      {/* Radar / Scanner area */}
      <div className="relative h-[500px] w-full max-w-5xl sm:h-[620px] lg:h-[700px]">
        {/* Radar rings */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <div className="relative h-[350px] w-[350px] sm:h-[460px] sm:w-[460px]">
            <div className="absolute inset-0 rounded-full border border-accent/10" />
            <div className="absolute inset-[15%] rounded-full border border-accent/8" />
            <div className="absolute inset-[30%] rounded-full border border-accent/6" />
            <div className="absolute inset-[42%] rounded-full border border-accent/15 bg-accent/5" />

            {/* Spinning sweep */}
            <div className="absolute inset-0 animate-spin-slow">
              <div className="absolute left-1/2 top-0 h-1/2 w-px origin-bottom bg-gradient-to-t from-accent/40 to-transparent" />
              <div
                className="absolute left-1/2 top-0 h-1/2 origin-bottom"
                style={{
                  width: "120px",
                  marginLeft: "-60px",
                  background: "conic-gradient(from -15deg, transparent, rgba(52, 211, 153, 0.06) 30deg, transparent 30deg)",
                }}
              />
            </div>

            {/* Center dot */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative">
                <div className="h-3 w-3 rounded-full bg-accent shadow-[0_0_12px_rgba(52,211,153,0.5)]" />
                <div className="absolute inset-0 h-3 w-3 animate-ping rounded-full bg-accent/60" />
              </div>
            </div>

            {/* Pulse rings */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="h-16 w-16 animate-[radarPulse_3s_ease-out_infinite] rounded-full border border-accent/30" />
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="h-16 w-16 animate-[radarPulse_3s_ease-out_1.5s_infinite] rounded-full border border-accent/20" />
            </div>
          </div>
        </div>

        {/* Floating item cards — desktop */}
        <div className="absolute inset-0 hidden lg:block">
          {cards.map((card, i) => {
            const pos = DESKTOP_POSITIONS[i];
            if (!pos) return null;
            const isVisible = visibleCards.includes(i);

            return (
              <Link
                key={`${card.id}-${i}`}
                href={card.id.length > 5 ? `/items/${card.id}` : "/items"}
                className="absolute transition-all duration-700 ease-out"
                style={{
                  left: `calc(50% + ${pos.x}px - 88px)`,
                  top: `calc(50% + ${pos.y}px - 80px)`,
                  opacity: isVisible ? 1 : 0,
                  transform: isVisible ? "scale(1)" : "scale(0.7)",
                }}
              >
                <div
                  className="w-44 overflow-hidden rounded-xl border border-border-light bg-bg-card/90 shadow-lg shadow-black/20 backdrop-blur-md transition-transform hover:scale-105 hover:shadow-xl"
                  style={{
                    animation: isVisible ? `heroFloat 6s ease-in-out ${i * 0.8}s infinite` : "none",
                  }}
                >
                  {card.image_url ? (
                    <div className="relative h-24 overflow-hidden bg-bg-elevated">
                      <img
                        src={card.image_url}
                        alt={card.title}
                        className="h-full w-full object-cover"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-bg/40 to-transparent" />
                    </div>
                  ) : (
                    <div className="flex h-24 items-center justify-center bg-bg-elevated">
                      <svg className="h-8 w-8 text-text-ghost" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                  )}
                  <div className="p-2.5">
                    <p className="text-xs font-semibold text-text truncate">{card.title}</p>
                    <p className="text-[10px] text-text-muted truncate">{card.location_id ?? "_"}</p>
                    <div className="mt-1.5">
                      <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium border ${
                        card.type === "LOST"
                          ? "bg-red-500/10 text-red-400 border-red-500/20"
                          : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                      }`}>
                        {card.type === "LOST" ? "Lost" : "Found"}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Mobile: show cards around radar */}
        <div className="absolute inset-0 lg:hidden">
          {cards.slice(0, 4).map((card, i) => {
            const pos = MOBILE_POSITIONS[i];
            const isVisible = visibleCards.includes(i);
            return (
              <Link
                key={`mobile-${card.id}-${i}`}
                href={card.id.length > 5 ? `/items/${card.id}` : "/items"}
                className="absolute transition-all duration-700 ease-out"
                style={{
                  left: `calc(50% + ${pos.x}px - 56px)`,
                  top: `calc(50% + ${pos.y}px - 50px)`,
                  opacity: isVisible ? 0.9 : 0,
                  transform: isVisible ? "scale(1)" : "scale(0.7)",
                  transitionDelay: `${i * 150}ms`,
                }}
              >
                <div
                  className="w-28 overflow-hidden rounded-lg border border-border-light bg-bg-card/80 shadow-md backdrop-blur-sm"
                  style={{
                    animation: isVisible ? `heroFloat 5s ease-in-out ${i * 0.6}s infinite` : "none",
                  }}
                >
                  {card.image_url ? (
                    <div className="relative h-16 overflow-hidden bg-bg-elevated">
                      <img
                        src={card.image_url}
                        alt={card.title}
                        className="h-full w-full object-cover"
                        loading="lazy"
                      />
                    </div>
                  ) : (
                    <div className="flex h-16 items-center justify-center bg-bg-elevated">
                      <svg className="h-5 w-5 text-text-ghost" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                  )}
                  <div className="p-1.5">
                    <p className="text-[10px] font-semibold text-text line-clamp-1">{card.title}</p>
                    <span className={`mt-0.5 inline-block rounded-full px-1.5 py-0.5 text-[8px] font-medium ${
                      card.type === "LOST"
                        ? "bg-red-500/10 text-red-400"
                        : "bg-emerald-500/10 text-emerald-400"
                    }`}>
                      {card.type === "LOST" ? "Lost" : "Found"}
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Status text */}
      <div className="flex flex-col items-center gap-2">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-accent">
          Searching
        </p>
        <p className="text-sm text-text-ghost transition-all duration-500">
          {SCAN_MESSAGES[messageIndex]}
        </p>
      </div>
    </div>
  );
}
