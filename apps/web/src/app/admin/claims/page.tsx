"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { EmptyState } from "@/components/EmptyState";

interface Claim {
  id: string;
  item_report_id: string;
  claimant_id: string;
  claimant_name?: string;
  item_title?: string;
  evidence_description: string;
  evidence_image_url?: string;
  status: string;
  created_at: string;
}

export default function AdminClaimsPage() {
  const [claims, setClaims] = useState<Claim[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("PENDING");
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchClaims = useCallback(() => {
    setLoading(true);
    const params = filter ? `?status=${filter}` : "";
    api.get<{ data: Claim[] }>(`/admin/claims${params}`)
      .then((res) => setClaims(res.data ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [filter]);

  useEffect(() => {
    fetchClaims();
  }, [fetchClaims]);

  const handleAction = async (claimId: string, action: "approve" | "reject") => {
    setActionLoading(claimId);
    try {
      await api.patch(`/claims/${claimId}/${action}`);
      setClaims((prev) => prev.filter((c) => c.id !== claimId));
    } catch {
      alert("Action failed");
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div>
      <h1 className="section-title">Claims</h1>
      <p className="section-subtitle">Review and process ownership claims.</p>

      <div className="mt-4 flex gap-2">
        {["PENDING", "APPROVED", "REJECTED", ""].map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setFilter(s)}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
              filter === s
                ? "bg-accent text-bg"
                : "bg-bg-elevated text-text-muted hover:text-text"
            }`}
          >
            {s || "All"}
          </button>
        ))}
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : claims.length > 0 ? (
        <div className="mt-6 space-y-3">
          {claims.map((claim) => (
            <div key={claim.id} className="card p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Link
                      href={`/items/${claim.item_report_id}`}
                      className="text-sm font-semibold text-accent hover:underline"
                    >
                      {claim.item_title ?? "View Item"}
                    </Link>
                    <span className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${
                      claim.status === "PENDING"
                        ? "bg-yellow-500/10 text-yellow-400 border-yellow-500/20"
                        : claim.status === "APPROVED"
                        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                        : "bg-red-500/10 text-red-400 border-red-500/20"
                    }`}>
                      {claim.status}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-text-muted">
                    Claimed by <span className="font-medium text-text-secondary">{claim.claimant_name ?? claim.claimant_id?.slice(0, 8) ?? "_"}</span>
                  </p>
                  <p className="mt-2 text-sm text-text-secondary">{claim.evidence_description ?? "_"}</p>
                  {claim.evidence_image_url && (
                    <img src={claim.evidence_image_url} alt="Evidence" className="mt-2 h-20 rounded-lg object-cover" />
                  )}
                  <p className="mt-2 text-[10px] text-text-ghost">
                    {claim.created_at ? new Date(claim.created_at).toLocaleString() : "_"}
                  </p>
                </div>

                {claim.status === "PENDING" && (
                  <div className="flex shrink-0 gap-2">
                    <button
                      type="button"
                      className="rounded-lg bg-red-500/10 border border-red-500/20 px-3 py-1.5 text-xs font-semibold text-red-400 hover:bg-red-500/20 disabled:opacity-50"
                      disabled={actionLoading === claim.id}
                      onClick={() => handleAction(claim.id, "reject")}
                    >
                      Reject
                    </button>
                    <button
                      type="button"
                      className="rounded-lg bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 text-xs font-semibold text-emerald-400 hover:bg-emerald-500/20 disabled:opacity-50"
                      disabled={actionLoading === claim.id}
                      onClick={() => handleAction(claim.id, "approve")}
                    >
                      Approve
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          title={filter === "PENDING" ? "No pending claims" : "No claims"}
          message={filter === "PENDING" ? "All claims have been processed." : "No claims match this filter."}
        />
      )}
    </div>
  );
}
