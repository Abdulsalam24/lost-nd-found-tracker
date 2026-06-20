"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { api } from "@/lib/api";

interface Claim {
  id: string;
  item_report_id: string;
  evidence_description: string;
  status: string;
  created_at: string;
  item_report?: {
    id: string;
    title: string;
    image_url?: string;
  };
}

function getStatusStyle(status: string) {
  switch (status) {
    case "APPROVED":
      return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
    case "REJECTED":
      return "bg-red-500/10 text-red-400 border-red-500/20";
    case "PENDING":
      return "bg-yellow-500/10 text-yellow-400 border-yellow-500/20";
    default:
      return "bg-bg-elevated text-text-muted border-border";
  }
}

export default function MyClaimsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [claims, setClaims] = useState<Claim[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push("/auth/login?redirect=/claims");
      return;
    }

    api.get<Claim[]>("/claims/my")
      .then(setClaims)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user, authLoading, router]);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-cream">
        <div className="mx-auto max-w-3xl px-4 py-12">
          <div className="h-8 w-32 rounded bg-bg-elevated animate-pulse mb-6" />
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="card flex items-center gap-4 p-4 animate-pulse">
                <div className="h-14 w-14 shrink-0 rounded-lg bg-bg-elevated" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-1/3 rounded bg-bg-elevated" />
                  <div className="h-3 w-2/3 rounded bg-bg-elevated" />
                </div>
                <div className="h-6 w-16 rounded-full bg-bg-elevated" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream">
      <div className="mx-auto max-w-3xl px-4 py-12">
        <h1 className="section-title">My Claims</h1>
        <p className="section-subtitle mt-1">Track the status of items you&apos;ve claimed</p>

        {claims.length === 0 ? (
          <div className="mt-8 card p-12 text-center">
            <svg className="mx-auto h-12 w-12 text-text-ghost" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
            <p className="mt-4 text-text-muted">No claims yet.</p>
            <p className="mt-1 text-xs text-text-ghost">
              Found something that belongs to you? Claim it from the item page.
            </p>
            <Link href="/items" className="btn-primary mt-6 inline-flex text-xs">Browse Items</Link>
          </div>
        ) : (
          <div className="mt-6 space-y-3">
            {claims.map((claim) => (
              <Link
                key={claim.id}
                href={`/claims/${claim.id}`}
                className="card flex items-center gap-4 p-4 transition-colors hover:bg-bg-hover"
              >
                {claim.item_report?.image_url ? (
                  <img
                    src={claim.item_report.image_url}
                    alt={claim.item_report.title ?? "Item"}
                    className="h-14 w-14 shrink-0 rounded-lg object-cover"
                  />
                ) : (
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-bg-elevated">
                    <svg className="h-6 w-6 text-text-ghost" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-text truncate">
                    {claim.item_report?.title ?? "Item"}
                  </p>
                  <p className="mt-0.5 text-xs text-text-muted truncate">
                    {claim.evidence_description}
                  </p>
                  <p className="mt-1 text-[10px] text-text-ghost">
                    {claim.created_at ? new Date(claim.created_at).toLocaleDateString() : "_"}
                  </p>
                </div>
                <span className={`shrink-0 rounded-full border px-2.5 py-1 text-xs font-semibold ${getStatusStyle(claim.status)}`}>
                  {claim.status ?? "_"}
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
