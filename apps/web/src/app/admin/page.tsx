"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";
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

interface MonthlyData {
  month: string;
  count: number;
}

export default function AdminDashboard() {
  const { user } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [monthly, setMonthly] = useState<MonthlyData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get<DashboardData>("/admin/dashboard"),
      api.get<MonthlyData[]>("/stats/by-month"),
    ])
      .then(([dashboard, monthlyData]) => {
        setData(dashboard);
        setMonthly(monthlyData.slice(-6));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner size="lg" />;

  const maxCount = Math.max(...monthly.map((m) => m.count), 1);
  const recoveryRate = data && data.totalItems > 0
    ? Math.round((data.recoveredItems / data.totalItems) * 100)
    : 0;

  const statCards = [
    {
      label: "Total Items",
      value: data?.totalItems ?? 0,
      icon: "M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4",
      bgClass: "bg-accent/10",
      iconClass: "text-accent",
      href: "/admin/items",
    },
    {
      label: "Pending Claims",
      value: data?.pendingClaims ?? 0,
      icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z",
      bgClass: "bg-amber-500/10",
      iconClass: "text-amber-500",
      href: "/admin/claims",
    },
    {
      label: "Recovered",
      value: data?.recoveredItems ?? 0,
      icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z",
      bgClass: "bg-emerald-500/10",
      iconClass: "text-emerald-500",
      href: "/admin/items",
    },
    {
      label: "Total Users",
      value: data?.totalUsers ?? 0,
      icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z",
      bgClass: "bg-blue-500/10",
      iconClass: "text-blue-500",
      href: "/admin/users",
    },
  ];

  return (
    <div>
      {/* Welcome */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold text-text">
            Welcome back, {user?.name?.split(" ")[0] ?? "Admin"}
          </h2>
          <p className="mt-0.5 text-sm text-text-muted">
            Here's what's happening on your platform today.
          </p>
        </div>
        <Link
          href="/admin/items"
          className="btn-primary text-xs shrink-0"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          View All Items
        </Link>
      </div>

      {/* Stat cards */}
      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {statCards.map((card) => (
          <Link key={card.label} href={card.href} className="card p-5 transition-colors hover:border-accent/30">
            <div className="flex items-start justify-between">
              <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${card.bgClass}`}>
                <svg className={`h-5 w-5 ${card.iconClass}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d={card.icon} />
                </svg>
              </div>
            </div>
            <p className="mt-4 text-2xl font-bold text-text">{card.value}</p>
            <p className="mt-0.5 text-xs text-text-muted">{card.label}</p>
            <div className="mt-3 flex items-center gap-1 text-[11px] font-medium text-text-ghost">
              View details
              <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </Link>
        ))}
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-3">
        {/* Chart — takes 2 cols */}
        <div className="xl:col-span-2">
          {monthly.length > 0 && (
            <div className="card p-5">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-text">Items Reported</h3>
                <span className="flex items-center gap-1.5 rounded-lg border border-border px-2.5 py-1 text-[11px] text-text-muted">
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Last {monthly.length} months
                </span>
              </div>

              <div className="mt-6">
                <div className="flex gap-3">
                  <div className="flex flex-col justify-between text-[10px] text-text-ghost w-7 text-right shrink-0" style={{ height: 180 }}>
                    <span>{maxCount}</span>
                    <span>{Math.round(maxCount * 0.66)}</span>
                    <span>{Math.round(maxCount * 0.33)}</span>
                    <span>0</span>
                  </div>
                  <div className="flex-1 relative" style={{ height: 180 }}>
                    {/* Grid lines */}
                    <div className="absolute inset-0 flex flex-col justify-between">
                      {[0, 1, 2, 3].map((i) => (
                        <div key={i} className="border-b border-border/40" />
                      ))}
                    </div>
                    {/* SVG chart */}
                    <svg className="absolute inset-0 w-full h-full overflow-visible" viewBox="0 0 100 100" preserveAspectRatio="none">
                      <defs>
                        <linearGradient id="adminChartFill" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="var(--color-accent, #3f8378)" stopOpacity="0.15" />
                          <stop offset="100%" stopColor="var(--color-accent, #3f8378)" stopOpacity="0" />
                        </linearGradient>
                      </defs>
                      {(() => {
                        const w = 100;
                        const h = 100;
                        const points = monthly.map((m, i) => ({
                          x: monthly.length > 1 ? (i / (monthly.length - 1)) * w : w / 2,
                          y: h - (m.count / maxCount) * h,
                        }));
                        const line = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
                        const area = line + ` L ${w} ${h} L 0 ${h} Z`;
                        return (
                          <>
                            <path d={area} fill="url(#adminChartFill)" vectorEffect="non-scaling-stroke" />
                            <path d={line} fill="none" stroke="var(--color-accent, #3f8378)" strokeWidth="2" vectorEffect="non-scaling-stroke" strokeLinejoin="round" />
                            {points.map((p, i) => (
                              <circle key={i} cx={p.x} cy={p.y} r="4" fill="var(--color-accent, #3f8378)" stroke="var(--color-bg-card, #141414)" strokeWidth="2" vectorEffect="non-scaling-stroke" />
                            ))}
                          </>
                        );
                      })()}
                    </svg>
                  </div>
                </div>
                <div className="flex gap-3 mt-2">
                  <div className="w-7 shrink-0" />
                  <div className="flex-1 flex justify-between text-[10px] text-text-ghost">
                    {monthly.map((m) => (
                      <span key={m.month}>
                        {new Date(m.month + "-01").toLocaleDateString("en", { month: "short" })}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right column — overview + recovery */}
        <div className="space-y-6">
          <div className="card p-5">
            <h3 className="text-sm font-bold text-text">Overview</h3>
            <div className="mt-4 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs text-text-muted">Active Items</span>
                <span className="text-sm font-bold text-text">{data?.activeItems ?? 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-text-muted">Recovery Rate</span>
                <span className="text-sm font-bold text-accent">{recoveryRate}%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-text-muted">Pending Claims</span>
                <span className="text-sm font-bold text-amber-500">{data?.pendingClaims ?? 0}</span>
              </div>
            </div>
            {/* Recovery progress bar */}
            <div className="mt-5">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-text-muted">Recovery progress</span>
                <span className="font-semibold text-accent">{recoveryRate}%</span>
              </div>
              <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-bg-elevated">
                <div
                  className="h-full rounded-full bg-accent transition-all duration-500"
                  style={{ width: `${recoveryRate}%` }}
                />
              </div>
            </div>
          </div>

          {/* Quick actions */}
          <div className="card p-5">
            <h3 className="text-sm font-bold text-text">Quick Actions</h3>
            <div className="mt-3 space-y-1.5">
              {[
                { href: "/admin/claims", label: "Review Claims", icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z", color: "text-amber-500" },
                { href: "/admin/users", label: "Manage Users", icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z", color: "text-accent" },
                { href: "/admin/games", label: "Manage Games", icon: "M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z", color: "text-purple-500" },
              ].map((action) => (
                <Link
                  key={action.href}
                  href={action.href}
                  className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-xs font-medium text-text-muted transition-colors hover:bg-bg-hover hover:text-text"
                >
                  <svg className={`h-4 w-4 ${action.color}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d={action.icon} />
                  </svg>
                  {action.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Reports */}
      <div className="mt-6 card p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-text">Recent Reports</h3>
          <Link href="/admin/items" className="text-xs font-medium text-accent hover:underline">
            View all
          </Link>
        </div>

        {data?.recentItems && data.recentItems.length > 0 ? (
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {data.recentItems.slice(0, 6).map((item) => (
              <Link
                key={item.id}
                href={`/items/${item.id}`}
                className="flex items-center gap-3 rounded-xl p-3 transition-colors hover:bg-bg-hover"
              >
                <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                  item.type === "LOST"
                    ? "bg-red-500/10 text-red-500"
                    : "bg-emerald-500/10 text-emerald-500"
                }`}>
                  {item.type === "LOST" ? "L" : "F"}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-text truncate">{item.title ?? "_"}</p>
                  <p className="text-[11px] text-text-muted truncate">
                    {item.reporter?.name ?? "_"}
                    <span className="mx-1 text-text-ghost">·</span>
                    {item.created_at ? new Date(item.created_at).toLocaleDateString("en", { month: "short", day: "numeric" }) : "_"}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-xs text-text-muted">No items yet.</p>
        )}
      </div>
    </div>
  );
}
