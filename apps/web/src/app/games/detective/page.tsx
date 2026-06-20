"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

interface DetectiveData {
  week_of: string;
  categories: string[];
}

const RULES = [
  { icon: "1", text: "Each week, items are reported across different categories (Electronics, Documents, etc.)." },
  { icon: "2", text: "Your job: guess which categories had the MOST lost items last week." },
  { icon: "3", text: "Drag the categories to rank them from most reported (#1) to least reported." },
  { icon: "4", text: "Exact position match = 2 points. Off by one position = 1 point." },
  { icon: "5", text: "Scores are revealed at the end of the week. Max 10 points per round!" },
];

export default function DetectivePage() {
  const { user, loading: authLoading } = useAuth();
  const [data, setData] = useState<DetectiveData | null>(null);
  const [ranking, setRanking] = useState<string[]>([]);
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showRules, setShowRules] = useState(false);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    api.get<DetectiveData>("/games/detective/current")
      .then((res) => {
        setData(res);
        setRanking(res.categories ?? []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user]);

  const handleDragStart = useCallback((idx: number) => {
    setDragIdx(idx);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent, idx: number) => {
    e.preventDefault();
    if (dragIdx === null || dragIdx === idx) return;

    setRanking((prev) => {
      const next = [...prev];
      const [moved] = next.splice(dragIdx, 1);
      next.splice(idx, 0, moved);
      return next;
    });
    setDragIdx(idx);
  }, [dragIdx]);

  const handleDragEnd = useCallback(() => {
    setDragIdx(null);
  }, []);

  const moveItem = (from: number, to: number) => {
    if (to < 0 || to >= ranking.length) return;
    setRanking((prev) => {
      const next = [...prev];
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
      return next;
    });
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setError("");
    try {
      await api.post("/games/detective/guess", { guessed_ranking: ranking });
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit guess");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || authLoading) return <LoadingSpinner size="lg" />;

  if (!user) {
    return (
      <div className="min-h-screen">
        <div className="mx-auto max-w-2xl px-4 py-8">
          <Link href="/games" className="flex items-center gap-1 text-xs text-text-muted hover:text-accent transition-colors">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Games
          </Link>
          <h1 className="mt-6 section-title">Detective Game</h1>
          <p className="section-subtitle mt-1">Rank categories by most lost items</p>

          <div className="mt-6 card p-5 space-y-3">
            <h3 className="text-xs font-bold text-text">How to Play</h3>
            {RULES.map((rule) => (
              <div key={rule.icon} className="flex items-start gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent/10 text-xs font-bold text-accent">
                  {rule.icon}
                </span>
                <p className="text-xs text-text-secondary">{rule.text}</p>
              </div>
            ))}
          </div>

          <div className="mt-6 text-center">
            <Link href="/auth/login?redirect=/games/detective" className="btn-primary inline-flex text-xs">
              Sign in to play
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-2xl px-4 py-8">
        <Link href="/games" className="flex items-center gap-1 text-xs text-text-muted hover:text-accent transition-colors">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Games
        </Link>

        <div className="mt-6 flex items-start justify-between">
          <div>
            <h1 className="section-title flex items-center gap-2">
              <svg className="h-6 w-6 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              Detective Game
            </h1>
            <p className="section-subtitle mt-1">Rank categories by most lost items</p>
          </div>
          <button
            type="button"
            onClick={() => setShowRules(!showRules)}
            className="shrink-0 flex items-center gap-1 rounded-lg border border-border-light px-3 py-1.5 text-xs font-medium text-text-muted transition-colors hover:bg-bg-hover hover:text-text"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            How to Play
          </button>
        </div>

        {/* Rules */}
        {showRules && (
          <div className="mt-4 card p-5 space-y-3">
            <h3 className="text-xs font-bold text-text">How Detective Game Works</h3>
            {RULES.map((rule) => (
              <div key={rule.icon} className="flex items-start gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent/10 text-xs font-bold text-accent">
                  {rule.icon}
                </span>
                <p className="text-xs text-text-secondary">{rule.text}</p>
              </div>
            ))}
          </div>
        )}

        {!data || !data.categories || data.categories.length === 0 ? (
          <div className="mt-6 card p-10 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-accent/10">
              <svg className="h-7 w-7 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="mt-3 font-semibold text-text">Not Enough Data</p>
            <p className="mt-1 text-xs text-text-muted">Check back when more items have been reported this week!</p>
          </div>
        ) : (
          <>
            <div className="mt-6 card overflow-hidden">
              <div className="border-b border-border bg-bg-elevated/50 px-5 py-3 flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-text-muted">Your Ranking</span>
                <span className="text-xs text-text-ghost">Week of {data.week_of ?? "_"}</span>
              </div>

              {error && (
                <div className="mx-5 mt-4 rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-xs text-red-400" role="alert">{error}</div>
              )}

              {success ? (
                <div className="p-8 text-center">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10">
                    <svg className="h-8 w-8 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <p className="mt-3 text-lg font-bold text-text">Guess Submitted!</p>
                  <p className="mt-1 text-xs text-text-muted">Results will be revealed at the end of the week.</p>
                </div>
              ) : (
                <>
                  <p className="px-5 pt-4 text-xs text-text-ghost">Drag to reorder, or use the arrows. #1 = most reported.</p>
                  <ul className="p-4 space-y-2" role="list">
                    {ranking.map((category, idx) => (
                      <li
                        key={category}
                        draggable
                        onDragStart={() => handleDragStart(idx)}
                        onDragOver={(e) => handleDragOver(e, idx)}
                        onDragEnd={handleDragEnd}
                        className={`flex cursor-grab items-center gap-3 rounded-xl border-2 p-3 text-xs transition-all ${
                          dragIdx === idx
                            ? "border-accent/40 bg-accent/5 shadow-sm"
                            : "border-border-light bg-bg-card hover:border-border hover:bg-bg-elevated"
                        }`}
                      >
                        <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                          idx === 0 ? "bg-yellow-500/10 text-yellow-500" :
                          idx === 1 ? "bg-gray-400/10 text-gray-400" :
                          idx === 2 ? "bg-orange-500/10 text-orange-400" :
                          "bg-bg-elevated text-text-muted"
                        }`}>
                          {idx + 1}
                        </span>
                        <svg className="h-4 w-4 shrink-0 text-text-ghost" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
                        </svg>
                        <span className="flex-1 font-medium text-text">{category}</span>
                        <div className="flex shrink-0 gap-1">
                          <button
                            type="button"
                            onClick={() => moveItem(idx, idx - 1)}
                            disabled={idx === 0}
                            className="rounded-lg p-1 text-text-ghost transition-colors hover:bg-bg-hover hover:text-text disabled:opacity-20"
                            aria-label="Move up"
                          >
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                            </svg>
                          </button>
                          <button
                            type="button"
                            onClick={() => moveItem(idx, idx + 1)}
                            disabled={idx === ranking.length - 1}
                            className="rounded-lg p-1 text-text-ghost transition-colors hover:bg-bg-hover hover:text-text disabled:opacity-20"
                            aria-label="Move down"
                          >
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>

                  <div className="px-4 pb-4">
                    <button
                      type="button"
                      className="btn-primary w-full"
                      onClick={handleSubmit}
                      disabled={submitting}
                    >
                      {submitting ? "Submitting..." : "Submit Guess"}
                    </button>
                  </div>
                </>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
