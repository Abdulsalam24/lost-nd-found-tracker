"use client";

import { useState, useEffect, useCallback } from "react";
import { api } from "@/lib/api";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { EmptyState } from "@/components/ui/EmptyState";

interface AuditEntry {
  id: string;
  action: string;
  actor_id: string;
  actor_name?: string;
  target_type: string;
  target_id: string;
  details?: string;
  created_at: string;
}

interface PaginatedAudit {
  data: AuditEntry[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

const ACTION_TYPES = [
  "ITEM_CREATED",
  "ITEM_UPDATED",
  "ITEM_DELETED",
  "CLAIM_CREATED",
  "CLAIM_APPROVED",
  "CLAIM_REJECTED",
  "USER_REGISTERED",
  "GAME_ACTION",
];

export default function AdminAuditPage() {
  const [audit, setAudit] = useState<PaginatedAudit>({ data: [], total: 0, page: 1, limit: 20, total_pages: 0 });
  const [loading, setLoading] = useState(true);
  const [filterAction, setFilterAction] = useState("");
  const [filterDate, setFilterDate] = useState("");
  const [page, setPage] = useState(1);

  const fetchAudit = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams();
    params.set("page", String(page));
    params.set("limit", "20");
    if (filterAction) params.set("action", filterAction);
    if (filterDate) params.set("date", filterDate);

    api.get<PaginatedAudit>(`/admin/audit?${params.toString()}`)
      .then(setAudit)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [page, filterAction, filterDate]);

  useEffect(() => {
    fetchAudit();
  }, [fetchAudit]);

  return (
    <div>
      <h1 className="section-title">Audit Log</h1>
      <p className="section-subtitle">Track all actions in the system.</p>

      <div className="mt-4 flex flex-wrap gap-3">
        <select
          className="input-field w-auto"
          value={filterAction}
          onChange={(e) => { setFilterAction(e.target.value); setPage(1); }}
          aria-label="Filter by action type"
        >
          <option value="">All Actions</option>
          {ACTION_TYPES.map((a) => (
            <option key={a} value={a}>{a.replace(/_/g, " ")}</option>
          ))}
        </select>
        <input
          type="date"
          className="input-field w-auto"
          value={filterDate}
          onChange={(e) => { setFilterDate(e.target.value); setPage(1); }}
          aria-label="Filter by date"
        />
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : audit.data.length > 0 ? (
        <>
          <div className="mt-6 card overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="table-header">
                  <th scope="col" className="px-4 py-3 text-left font-semibold text-ink-faint">Action</th>
                  <th scope="col" className="px-4 py-3 text-left font-semibold text-ink-faint">Actor</th>
                  <th scope="col" className="px-4 py-3 text-left font-semibold text-ink-faint">Target</th>
                  <th scope="col" className="px-4 py-3 text-left font-semibold text-ink-faint">Details</th>
                  <th scope="col" className="px-4 py-3 text-left font-semibold text-ink-faint">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cream-200">
                {audit.data.map((entry) => (
                  <tr key={entry.id} className="table-row">
                    <td className="px-4 py-3">
                      <span className="badge-gray">
                        {entry.action ?? "_"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-ink">{entry.actor_name ?? entry.actor_id ?? "_"}</td>
                    <td className="px-4 py-3 text-xs text-ink-faint">
                      {entry.target_type ?? "_"} / {entry.target_id ?? "_"}
                    </td>
                    <td className="max-w-xs truncate px-4 py-3 text-xs text-ink-faint">
                      {entry.details ?? "_"}
                    </td>
                    <td className="px-4 py-3 text-xs text-ink-ghost">
                      {entry.created_at ? new Date(entry.created_at).toLocaleString() : "_"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-4 flex justify-center gap-2">
            <button
              type="button"
              className="btn-secondary text-xs"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
            >
              Previous
            </button>
            <span className="flex items-center text-xs text-ink-muted">
              Page {audit.page} of {audit.total_pages}
            </span>
            <button
              type="button"
              className="btn-secondary text-xs"
              disabled={page >= audit.total_pages}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </button>
          </div>
        </>
      ) : (
        <EmptyState title="No audit entries" message="No logs match your filters." />
      )}
    </div>
  );
}
