"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { HeroSection } from "@/features/homepage/HeroSection";
import { StatsBar } from "@/features/homepage/StatsBar";
import { RecentItems } from "@/features/homepage/RecentItems";
import { GamesTeaser } from "@/features/homepage/GamesTeaser";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3002";

export default function HomePage() {
  const [items, setItems] = useState<any[]>([]);
  const [stats, setStats] = useState({ total_items: 0, total_recovered: 0, recovery_rate: 0 });

  useEffect(() => {
    axios.get(`${API_BASE}/items?limit=8`)
      .then((res) => setItems(res.data.data ?? []))
      .catch(() => {});
    axios.get(`${API_BASE}/stats`)
      .then((res) => setStats(res.data))
      .catch(() => {});
  }, []);

  return (
    <div className="relative">
      <HeroSection totalItems={stats.total_items} />
      <StatsBar
        totalItems={stats.total_items}
        totalRecovered={stats.total_recovered}
        recoveryRate={stats.recovery_rate}
      />
      <RecentItems items={items} />
      <div className="mx-auto max-w-6xl border-t border-border" />
      <GamesTeaser />
    </div>
  );
}
