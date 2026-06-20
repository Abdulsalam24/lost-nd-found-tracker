import { serverFetch } from "@/lib/api";
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

  const activeItems = (stats.total_items ?? 0) - (stats.total_recovered ?? 0);

  return (
      <div className="min-h-screen bg-cream">
        <div className="mx-auto max-w-7xl px-4 py-8">
          <h1 className="section-title">Campus Statistics</h1>
          <p className="section-subtitle">Lost and found data at a glance</p>

          {/* Stat cards */}
          <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
            <div className="card p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent/10">
                  <svg className="h-5 w-5 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <div>
                  <p className="text-2xl font-bold text-text">{stats.total_items ?? 0}</p>
                  <p className="text-xs text-text-muted">Total Reports</p>
                </div>
              </div>
            </div>

            <div className="card p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-500/10">
                  <svg className="h-5 w-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-2xl font-bold text-text">{stats.total_lost ?? 0}</p>
                  <p className="text-xs text-text-muted">Lost Items</p>
                </div>
              </div>
            </div>

            <div className="card p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10">
                  <svg className="h-5 w-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-2xl font-bold text-text">{stats.total_recovered ?? 0}</p>
                  <p className="text-xs text-text-muted">Recovered</p>
                </div>
              </div>
            </div>

            <div className="card p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-yellow-500/10">
                  <svg className="h-5 w-5 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
                <div>
                  <p className="text-2xl font-bold text-accent">{stats.recovery_rate ?? 0}%</p>
                  <p className="text-xs text-text-muted">Recovery Rate</p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick summary */}
          <div className="mt-6 card p-5">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full bg-red-400" />
                  <span className="text-xs text-text-secondary">{stats.total_lost ?? 0} lost</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full bg-emerald-400" />
                  <span className="text-xs text-text-secondary">{stats.total_found ?? 0} found</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full bg-yellow-400" />
                  <span className="text-xs text-text-secondary">{activeItems} active</span>
                </div>
              </div>
              <span className="text-xs text-text-ghost">{stats.total_claims ?? 0} claims submitted</span>
            </div>
          </div>

          <StatsCharts
            categoryStats={categoryStats}
            monthlyStats={monthlyStats}
            recoveryRate={stats.recovery_rate}
          />
        </div>
      </div>
  );
}
