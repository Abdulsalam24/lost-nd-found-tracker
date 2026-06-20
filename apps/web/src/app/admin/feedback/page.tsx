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
  const [actionLoading, setActionLoading] = useState<string | null>(null);

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

  const handleMarkReviewed = async (id: string) => {
    setActionLoading(id);
    try {
      await api.patch(`/feedback/${id}/reviewed`);
      setFeedback((prev) =>
        prev.map((f) => (f.id === id ? { ...f, reviewed: true } : f))
      );
    } catch {
      alert("Failed to mark as reviewed");
    } finally {
      setActionLoading(null);
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
      <h1 className="section-title">Feedback</h1>
      <p className="section-subtitle">User feedback and suggestions.</p>

      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="card p-4">
          <p className="text-2xl font-bold text-text">{feedback.length}</p>
          <p className="text-xs text-text-muted">Total</p>
        </div>
        <div className="card p-4">
          <p className="text-2xl font-bold text-yellow-400">
            {feedback.filter((f) => !f.reviewed).length}
          </p>
          <p className="text-xs text-text-muted">Pending</p>
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
            className={`rounded-lg px-3 py-1.5 text-xs font-medium capitalize transition-colors ${
              filter === s
                ? "bg-accent text-bg"
                : "bg-bg-elevated text-text-muted hover:text-text"
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
                    <span className="text-xs font-semibold text-text">
                      {item.user?.name ?? "Anonymous"}
                    </span>
                    {item.rating != null && (
                      <span className="flex items-center gap-0.5 text-xs text-yellow-400">
                        {"★".repeat(item.rating)}
                        {"☆".repeat(5 - item.rating)}
                      </span>
                    )}
                    <span
                      className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${
                        item.reviewed
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                          : "bg-yellow-500/10 text-yellow-400 border-yellow-500/20"
                      }`}
                    >
                      {item.reviewed ? "Reviewed" : "Pending"}
                    </span>
                  </div>
                  {item.user?.email && (
                    <p className="mt-0.5 text-[10px] text-text-ghost">{item.user.email}</p>
                  )}
                  <p className="mt-2 text-xs text-text-secondary whitespace-pre-wrap">
                    {item.message}
                  </p>
                  <p className="mt-2 text-[10px] text-text-ghost">
                    {item.created_at ? new Date(item.created_at).toLocaleString() : "_"}
                  </p>
                </div>

                {!item.reviewed && (
                  <button
                    type="button"
                    className="shrink-0 rounded-lg bg-accent/10 border border-accent/20 px-3 py-1.5 text-xs font-semibold text-accent hover:bg-accent/20 disabled:opacity-50"
                    disabled={actionLoading === item.id}
                    onClick={() => handleMarkReviewed(item.id)}
                  >
                    {actionLoading === item.id ? "..." : "Mark Reviewed"}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          title={filter === "pending" ? "No pending feedback" : "No feedback"}
          message={
            filter === "pending"
              ? "All feedback has been reviewed."
              : "No feedback submissions yet."
          }
        />
      )}
    </div>
  );
}
