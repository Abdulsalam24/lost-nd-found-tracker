"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

interface DashboardData {
  totalUsers: number;
  totalItems: number;
  activeItems: number;
  recoveredItems: number;
  pendingClaims: number;
  recentItems: Array<{
    id: string;
    title: string;
    type: string;
    status: string;
    created_at: string;
    reporter?: { name: string };
    location?: { name: string };
  }>;
}

export default function AdminDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<DashboardData>("/admin/dashboard")
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner size="lg" />;

  return (
    <div>
      <h1 className="section-title">Admin Dashboard</h1>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="card p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent/10">
              <svg className="h-5 w-5 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <div>
              <p className="text-2xl font-bold text-text">{data?.totalItems ?? 0}</p>
              <p className="text-xs text-text-muted">Total Items</p>
            </div>
          </div>
        </div>

        <Link href="/admin/claims" className="card p-5 transition-colors hover:bg-bg-hover">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-yellow-500/10">
              <svg className="h-5 w-5 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-2xl font-bold text-text">{data?.pendingClaims ?? 0}</p>
              <p className="text-xs text-text-muted">Pending Claims</p>
            </div>
          </div>
        </Link>

        <div className="card p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-500/10">
              <svg className="h-5 w-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <div>
              <p className="text-2xl font-bold text-text">{data?.activeItems ?? 0}</p>
              <p className="text-xs text-text-muted">Active Items</p>
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
              <p className="text-2xl font-bold text-text">{data?.recoveredItems ?? 0}</p>
              <p className="text-xs text-text-muted">Recovered</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent items */}
      <div className="mt-8">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-text">Recent Items</h2>
          <Link href="/admin/items" className="text-xs font-medium text-accent hover:underline">
            View all
          </Link>
        </div>

        {data?.recentItems && data.recentItems.length > 0 ? (
          <div className="mt-4 space-y-2">
            {data.recentItems.map((item) => (
              <Link
                key={item.id}
                href={`/items/${item.id}`}
                className="card flex items-center gap-4 p-4 transition-colors hover:bg-bg-hover"
              >
                <span className={`shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-semibold ${
                  item.type === "LOST"
                    ? "bg-red-500/10 text-red-400 border-red-500/20"
                    : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                }`}>
                  {item.type}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-text truncate">{item.title ?? "_"}</p>
                  <p className="text-xs text-text-muted">
                    by {item.reporter?.name ?? "_"} {item.location?.name ? `at ${item.location.name}` : ""}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <span className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${
                    item.status === "ACTIVE"
                      ? "bg-yellow-500/10 text-yellow-400 border-yellow-500/20"
                      : item.status === "RECOVERED"
                      ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                      : "bg-bg-elevated text-text-muted border-border"
                  }`}>
                    {item.status}
                  </span>
                  <p className="mt-1 text-[10px] text-text-ghost">
                    {item.created_at ? new Date(item.created_at).toLocaleDateString() : "_"}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <p className="mt-4 text-xs text-text-muted">No items yet.</p>
        )}
      </div>
    </div>
  );
}
