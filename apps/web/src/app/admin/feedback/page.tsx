"use client";

import { useState, useEffect, useCallback } from "react";
import { api } from "@/lib/api";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { EmptyState } from "@/components/ui/EmptyState";

interface FeedbackItem {
  id: string;
  message: string;
  rating: number | null;
  reviewed: boolean;
  created_at: string;
  user: { id: string; name: string; email: string } | null;
}

export default function AdminFeedbackPage() {
  const [feedback, setFeedback] = useState<FeedbackItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "pending" | "reviewed">("pending");
  const [confirmTarget, setConfirmTarget] = useState<FeedbackItem | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchFeedback = useCallback(() => {
    setLoading(true);
    api.get<FeedbackItem[]>("/feedback")
      .then((data) => setFeedback(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchFeedback();
  }, [fetchFeedback]);

  const confirmMarkReviewed = async () => {
    if (!confirmTarget) return;
    setActionLoading(true);
    try {
      await api.patch(`/feedback/${confirmTarget.id}/reviewed`);
      setFeedback((prev) =>
        prev.map((f) => (f.id === confirmTarget.id ? { ...f, reviewed: true } : f))
      );
      setConfirmTarget(null);
    } catch {
      alert("Failed to mark as reviewed");
    } finally {
      setActionLoading(false);
    }
  };

  const filtered = feedback.filter((f) => {
    if (filter === "pending") return !f.reviewed;
    if (filter === "reviewed") return f.reviewed;
    return true;
  });

  const avgRating =
    feedback.filter((f) => f.rating != null).length > 0
      ? (
          feedback.filter((f) => f.rating != null).reduce((sum, f) => sum + (f.rating ?? 0), 0) /
          feedback.filter((f) => f.rating != null).length
        ).toFixed(1)
      : "_";

  return (
    <div>
      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="card p-4">
          <p className="text-2xl font-bold text-text">{feedback.length}</p>
          <p className="text-xs text-text-muted">Total Feedback</p>
        </div>
        <div className="card p-4">
          <p className="text-2xl font-bold text-amber-500">
            {feedback.filter((f) => !f.reviewed).length}
          </p>
          <p className="text-xs text-text-muted">Pending Review</p>
        </div>
        <div className="card p-4">
          <p className="text-2xl font-bold text-accent">{avgRating}</p>
          <p className="text-xs text-text-muted">Avg Rating</p>
        </div>
      </div>

      <div className="mt-6 flex gap-2">
        {(["pending", "reviewed", "all"] as const).map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setFilter(s)}
            className={`rounded-full px-4 py-1.5 text-xs font-medium capitalize transition-colors ${
              filter === s
                ? "bg-accent text-white"
                : "bg-bg-elevated text-text-muted hover:text-text hover:bg-bg-hover"
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : filtered.length > 0 ? (
        <div className="mt-6 space-y-3">
          {filtered.map((item) => (
            <div key={item.id} className="card p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-semibold text-text">
                      {item.user?.name ?? "Anonymous"}
                    </span>
                    {item.rating != null && (
                      <span className="flex items-center gap-0.5 text-xs text-amber-500">
                        {"★".repeat(item.rating)}
                        {"☆".repeat(5 - item.rating)}
                      </span>
                    )}
                    <span
                      className={`rounded-full border px-2.5 py-0.5 text-[10px] font-semibold ${
                        item.reviewed
                          ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                          : "bg-amber-500/10 text-amber-600 border-amber-500/20"
                      }`}
                    >
                      {item.reviewed ? "Reviewed" : "Pending"}
                    </span>
                  </div>
                  {item.user?.email && (
                    <p className="mt-0.5 text-[11px] text-text-ghost">{item.user.email}</p>
                  )}
                  <p className="mt-2 text-xs text-text-secondary whitespace-pre-wrap leading-relaxed">
                    {item.message}
                  </p>
                  <p className="mt-2 text-[11px] text-text-ghost">
                    {item.created_at ? new Date(item.created_at).toLocaleString() : "_"}
                  </p>
                </div>

                {!item.reviewed && (
                  <button
                    type="button"
                    className="shrink-0 rounded-lg bg-accent/10 border border-accent/20 px-3.5 py-2 text-xs font-semibold text-accent hover:bg-accent/20 transition-colors"
                    onClick={() => setConfirmTarget(item)}
                  >
                    Mark Reviewed
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          title={filter === "pending" ? "No pending feedback" : "No feedback"}
          message={filter === "pending" ? "All feedback has been reviewed." : "No feedback submissions yet."}
        />
      )}

      {/* Confirm modal */}
      {confirmTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4" onClick={() => setConfirmTarget(null)}>
          <div className="w-full max-w-sm rounded-2xl border border-border bg-bg-card p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-base font-semibold text-text">Mark as Reviewed</h3>
            <p className="mt-1 text-xs text-text-secondary">
              Mark feedback from <strong className="text-text">{confirmTarget.user?.name ?? "Anonymous"}</strong> as reviewed?
            </p>
            <div className="mt-6 flex gap-3 justify-end">
              <button type="button" className="btn-secondary text-xs" onClick={() => setConfirmTarget(null)} disabled={actionLoading}>Cancel</button>
              <button type="button" className="btn-primary text-xs" onClick={confirmMarkReviewed} disabled={actionLoading}>
                {actionLoading ? "Processing..." : "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
