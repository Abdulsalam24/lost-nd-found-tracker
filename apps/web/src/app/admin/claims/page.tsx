"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { EmptyState } from "@/components/ui/EmptyState";

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
  const [actionTarget, setActionTarget] = useState<{ claim: Claim; action: "approve" | "reject" } | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [toast, setToast] = useState("");

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(""), 4000);
    return () => clearTimeout(t);
  }, [toast]);

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

  const confirmAction = async () => {
    if (!actionTarget) return;
    setActionLoading(true);
    try {
      await api.patch(`/claims/${actionTarget.claim.id}/${actionTarget.action}`);
      setClaims((prev) => prev.filter((c) => c.id !== actionTarget.claim.id));
      setActionTarget(null);
    } catch {
      setToast("Action failed");
    } finally {
      setActionLoading(false);
    }
  };

  const statusBadge = (status: string) => {
    const styles = {
      PENDING: "bg-amber-500/10 text-amber-600 border-amber-500/20",
      APPROVED: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
      REJECTED: "bg-red-500/10 text-red-600 border-red-500/20",
    }[status] ?? "bg-bg-elevated text-text-muted border-border";
    return <span className={`rounded-full border px-2.5 py-0.5 text-[10px] font-semibold ${styles}`}>{status}</span>;
  };

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {["PENDING", "APPROVED", "REJECTED", ""].map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setFilter(s)}
            className={`rounded-full px-4 py-1.5 text-xs font-medium transition-colors ${
              filter === s
                ? "bg-accent text-white"
                : "bg-bg-elevated text-text-muted hover:text-text hover:bg-bg-hover"
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
                    {statusBadge(claim.status)}
                  </div>
                  <p className="mt-1.5 text-xs text-text-muted">
                    Claimed by <span className="font-medium text-text">{claim.claimant_name ?? claim.claimant_id?.slice(0, 8) ?? "_"}</span>
                  </p>
                  <p className="mt-2 text-xs text-text-secondary leading-relaxed">{claim.evidence_description ?? "_"}</p>
                  {claim.evidence_image_url && (
                    <img src={claim.evidence_image_url} alt="Evidence" className="mt-3 h-24 rounded-lg object-cover" />
                  )}
                  <p className="mt-2 text-[11px] text-text-ghost">
                    {claim.created_at ? new Date(claim.created_at).toLocaleString() : "_"}
                  </p>
                </div>

                {claim.status === "PENDING" && (
                  <div className="flex shrink-0 gap-2">
                    <button
                      type="button"
                      className="rounded-lg bg-red-500/10 border border-red-500/20 px-3.5 py-2 text-xs font-semibold text-red-600 hover:bg-red-500/20 transition-colors"
                      onClick={() => setActionTarget({ claim, action: "reject" })}
                    >
                      Reject
                    </button>
                    <button
                      type="button"
                      className="rounded-lg bg-emerald-500/10 border border-emerald-500/20 px-3.5 py-2 text-xs font-semibold text-emerald-600 hover:bg-emerald-500/20 transition-colors"
                      onClick={() => setActionTarget({ claim, action: "approve" })}
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

      {/* Confirm modal */}
      {actionTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4" onClick={() => setActionTarget(null)}>
          <div className="w-full max-w-sm rounded-2xl border border-border bg-bg-card p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start gap-3">
              <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
                actionTarget.action === "approve" ? "bg-emerald-500/10" : "bg-red-500/10"
              }`}>
                <svg className={`h-5 w-5 ${actionTarget.action === "approve" ? "text-emerald-500" : "text-red-500"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={actionTarget.action === "approve" ? "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" : "M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"} />
                </svg>
              </span>
              <div>
                <h3 className="text-base font-semibold text-text capitalize">{actionTarget.action} Claim</h3>
                <p className="mt-1 text-xs text-text-secondary">
                  Are you sure you want to {actionTarget.action} the claim for <strong className="text-text">{actionTarget.claim.item_title ?? "this item"}</strong>?
                </p>
              </div>
            </div>
            <div className="mt-6 flex gap-3 justify-end">
              <button type="button" className="btn-secondary text-xs" onClick={() => setActionTarget(null)} disabled={actionLoading}>Cancel</button>
              <button
                type="button"
                className={`inline-flex items-center justify-center rounded-full px-6 py-3 text-xs font-semibold text-white transition-all disabled:opacity-50 ${
                  actionTarget.action === "approve" ? "bg-emerald-500 hover:bg-emerald-600" : "bg-red-500 hover:bg-red-600"
                }`}
                onClick={confirmAction}
                disabled={actionLoading}
              >
                {actionLoading ? "Processing..." : actionTarget.action === "approve" ? "Approve" : "Reject"}
              </button>
            </div>
          </div>
        </div>
      )}
      {toast && (
        <div className="fixed top-20 right-4 z-50 animate-fade-in">
          <div className="flex items-center gap-3 rounded-xl border border-red-800/50 bg-red-950/90 px-4 py-3 shadow-lg backdrop-blur-sm max-w-sm">
            <p className="text-xs font-medium text-red-200">{toast}</p>
            <button type="button" onClick={() => setToast("")} className="ml-auto text-red-400 hover:text-red-300">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
