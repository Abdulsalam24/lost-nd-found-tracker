import Script from "next/script";
import { serverFetch } from "@/lib/api";
import { StatCard } from "@/components/StatCard";
import { StatsCharts } from "./StatsCharts";

interface StatsResponse {
  total_items: number;
  total_lost: number;
  total_found: number;
  total_recovered: number;
  total_claims: number;
  recovery_rate: number;
}

interface CategoryStat {
  category: string;
  count: number;
}

interface MonthlyStat {
  month: string;
  count: number;
}

async function getStats(): Promise<StatsResponse> {
  try {
    return await serverFetch<StatsResponse>("/stats");
  } catch {
    return { total_items: 0, total_lost: 0, total_found: 0, total_recovered: 0, total_claims: 0, recovery_rate: 0 };
  }
}

async function getCategoryStats(): Promise<CategoryStat[]> {
  try {
    return await serverFetch<CategoryStat[]>("/stats/by-category");
  } catch {
    return [];
  }
}

async function getMonthlyStats(): Promise<MonthlyStat[]> {
  try {
    return await serverFetch<MonthlyStat[]>("/stats/by-month");
  } catch {
    return [];
  }
}

export default async function StatsPage() {
  const [stats, categoryStats, monthlyStats] = await Promise.all([
    getStats(),
    getCategoryStats(),
    getMonthlyStats(),
  ]);

  return (
    <>
      <Script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.1/dist/chart.umd.min.js" strategy="beforeInteractive" />

      <div className="min-h-screen bg-cream">
        <div className="mx-auto max-w-7xl px-4 py-8">
          <h1 className="section-title">Statistics</h1>
          <p className="section-subtitle">Campus lost and found data at a glance.</p>

          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard label="Total Items" value={stats.total_items ?? "_"} />
            <StatCard label="Items Recovered" value={stats.total_recovered ?? "_"} />
            <StatCard label="Active Items" value={stats.total_items != null && stats.total_recovered != null ? stats.total_items - stats.total_recovered : "_"} />
            <StatCard label="Recovery Rate" value={`${stats.recovery_rate ?? 0}%`} />
          </div>

          <StatsCharts
            categoryStats={categoryStats}
            monthlyStats={monthlyStats}
            recoveryRate={stats.recovery_rate}
          />
        </div>
      </div>
    </>
  );
}
