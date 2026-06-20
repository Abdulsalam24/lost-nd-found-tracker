"use client";

import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { HeroSection } from "@/features/homepage/HeroSection";
import { StatsBar } from "@/features/homepage/StatsBar";
import { RecentItems } from "@/features/homepage/RecentItems";
import { GamesTeaser } from "@/features/homepage/GamesTeaser";
import { GridBackground } from "@/components/global/GridBackground";
import { Footer } from "@/components/global/Footer";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3002";

export default function HomePage() {
  const [items, setItems] = useState<any[]>([]);
  const [stats, setStats] = useState({ total_items: 0, total_recovered: 0, recovery_rate: 0 });
  const [loading, setLoading] = useState(true);
  const fetched = useRef(false);

  useEffect(() => {
    if (fetched.current) return;
    fetched.current = true;

    Promise.all([
      axios.get(`${API_BASE}/items?limit=8`).then((res) => setItems(res.data.data ?? [])).catch(() => {}),
      axios.get(`${API_BASE}/stats`).then((res) => setStats(res.data)).catch(() => {}),
    ]).finally(() => setLoading(false));
  }, []);

  return (
    <div className="relative">
      <GridBackground />
      <HeroSection totalItems={stats.total_items} />
      <StatsBar
        totalItems={stats.total_items}
        totalRecovered={stats.total_recovered}
        recoveryRate={stats.recovery_rate}
      />
      <RecentItems items={items} loading={loading} />
      <div className="mx-auto max-w-6xl border-t border-border" />
      <GamesTeaser />
      <Footer />
    </div>
  );
}
