"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { StatCard } from "@/components/StatCard";
import { LoadingSpinner } from "@/components/LoadingSpinner";

interface AdminStats {
  total_items: number;
  pending_claims: number;
  active_items: number;
  recovered_this_week: number;
}

interface ActivityEntry {
  id: string;
  action: string;
  actor_name: string;
  description: string;
  created_at: string;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [activity, setActivity] = useState<ActivityEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get<AdminStats>("/admin/stats"),
      api.get<{ data: ActivityEntry[] }>("/admin/activity?limit=10"),
    ])
      .then(([s, a]) => {
        setStats(s);
        setActivity(a.data ?? []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner size="lg" />;

  return (
    <div>
      <h1 className="section-title">Admin Dashboard</h1>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Items" value={stats?.total_items ?? "_"} />
        <StatCard label="Pending Claims" value={stats?.pending_claims ?? "_"} />
        <StatCard label="Active Items" value={stats?.active_items ?? "_"} />
        <StatCard label="Recovered This Week" value={stats?.recovered_this_week ?? "_"} />
      </div>

      <div className="mt-8">
        <h2 className="text-lg font-bold text-ink">Recent Activity</h2>
        {activity.length > 0 ? (
          <ul className="mt-4 space-y-3">
            {activity.map((entry) => (
              <li key={entry.id} className="card flex items-start gap-3 p-4">
                <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-coral-50">
                  <svg className="h-4 w-4 text-coral" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-ink">
                    <span className="font-semibold text-coral">{entry.actor_name ?? "_"}</span>{" "}
                    {entry.description ?? "_"}
                  </p>
                  <time className="text-xs text-ink-ghost" dateTime={entry.created_at}>
                    {entry.created_at ? new Date(entry.created_at).toLocaleString() : "_"}
                  </time>
                </div>
                <span className="badge-gray shrink-0">
                  {entry.action ?? "_"}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-4 text-sm text-ink-muted">No recent activity.</p>
        )}
      </div>
    </div>
  );
}
