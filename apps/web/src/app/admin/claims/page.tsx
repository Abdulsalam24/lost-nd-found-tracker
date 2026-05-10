"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { StatusBadge } from "@/components/StatusBadge";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { EmptyState } from "@/components/EmptyState";

interface Claim {
  id: string;
  item_report_id: string;
  claimant_id: string;
  claimant_name?: string;
  item_title?: string;
  evidence_description: string;
  status: string;
  created_at: string;
}

export default function AdminClaimsPage() {
  const [claims, setClaims] = useState<Claim[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchClaims = useCallback(() => {
    api.get<{ data: Claim[] }>("/admin/claims?status=PENDING")
      .then((res) => setClaims(res.data ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchClaims();
  }, [fetchClaims]);

  const handleAction = async (claimId: string, action: "approve" | "reject") => {
    setActionLoading(claimId);
    try {
      await api.patch(`/admin/claims/${claimId}/${action}`);
      setClaims((prev) => prev.filter((c) => c.id !== claimId));
    } catch {
      alert("Action failed");
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) return <LoadingSpinner size="lg" />;

  return (
    <div>
      <h1 className="section-title">Pending Claims</h1>
      <p className="section-subtitle">Review and process ownership claims.</p>

      {claims.length > 0 ? (
        <div className="mt-6 card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="table-header">
                <th scope="col" className="px-4 py-3 text-left font-semibold text-ink-faint">Item</th>
                <th scope="col" className="px-4 py-3 text-left font-semibold text-ink-faint">Claimant</th>
                <th scope="col" className="px-4 py-3 text-left font-semibold text-ink-faint">Evidence</th>
                <th scope="col" className="px-4 py-3 text-left font-semibold text-ink-faint">Date</th>
                <th scope="col" className="px-4 py-3 text-right font-semibold text-ink-faint">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cream-200">
              {claims.map((claim) => (
                <tr key={claim.id} className="table-row">
                  <td className="px-4 py-3">
                    <Link
                      href={`/items/${claim.item_report_id}`}
                      className="font-semibold text-coral hover:text-coral-dark"
                    >
                      {claim.item_title ?? "View Item"}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-ink">
                    {claim.claimant_name ?? claim.claimant_id ?? "_"}
                  </td>
                  <td className="max-w-xs truncate px-4 py-3 text-ink-muted">
                    {claim.evidence_description ?? "_"}
                  </td>
                  <td className="px-4 py-3 text-xs text-ink-ghost">
                    {claim.created_at ? new Date(claim.created_at).toLocaleDateString() : "_"}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        className="btn-danger text-xs"
                        disabled={actionLoading === claim.id}
                        onClick={() => handleAction(claim.id, "reject")}
                      >
                        Reject
                      </button>
                      <button
                        type="button"
                        className="btn-primary text-xs"
                        disabled={actionLoading === claim.id}
                        onClick={() => handleAction(claim.id, "approve")}
                      >
                        Approve
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <EmptyState title="No pending claims" message="All claims have been processed." />
      )}
    </div>
  );
}
