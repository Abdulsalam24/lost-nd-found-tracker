"use client";

import { useState, useEffect, useCallback } from "react";
import { api } from "@/lib/api";
import { LoadingSpinner } from "@/components/LoadingSpinner";

interface DetectiveData {
  week: string;
  deadline: string;
  faculties: string[];
  submitted: boolean;
  result?: {
    real_ranking: string[];
    score: number;
  };
}

export default function DetectivePage() {
  const [data, setData] = useState<DetectiveData | null>(null);
  const [ranking, setRanking] = useState<string[]>([]);
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<DetectiveData>("/games/detective/current")
      .then((res) => {
        setData(res);
        setRanking(res.faculties);
      })
      .catch(() => setError("Failed to load game data"))
      .finally(() => setLoading(false));
  }, []);

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

  if (loading) return <LoadingSpinner size="lg" />;

  if (!data) {
    return (
      <div className="min-h-screen bg-cream">
        <div className="mx-auto max-w-2xl px-4 py-8 text-center">
          <h1 className="section-title">Detective Game</h1>
          <p className="mt-4 text-ink-muted">No active game this week. Check back later!</p>
        </div>
      </div>
    );
  }

  const pastDeadline = new Date(data.deadline) < new Date();

  return (
    <div className="min-h-screen bg-cream">
      <div className="mx-auto max-w-2xl px-4 py-8">
        <h1 className="section-title">Detective Game</h1>
        <p className="section-subtitle">
          Rank the faculties by number of lost items this week. Drag to reorder.
        </p>

        <div className="mt-4 card p-4">
          <div className="flex items-center justify-between text-sm">
            <span className="font-semibold text-ink">Week: {data.week ?? "_"}</span>
            <span className="text-ink-faint">
              Deadline: {data.deadline ? new Date(data.deadline).toLocaleDateString() : "_"}
            </span>
          </div>
        </div>

        {error && (
          <div className="mt-4 rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-600" role="alert">{error}</div>
        )}

        {success || data.submitted ? (
          <div className="mt-6 card p-6 text-center">
            <svg className="mx-auto h-12 w-12 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="mt-2 text-lg font-bold text-ink">Guess Submitted!</p>
            <p className="text-sm text-ink-muted">Results will be revealed after the deadline.</p>
          </div>
        ) : pastDeadline && data.result ? (
          <div className="mt-6 space-y-4">
            <div className="card p-6 text-center">
              <p className="text-lg font-bold text-ink">Your Score: <span className="text-coral">{data.result.score ?? "_"}</span> points</p>
            </div>
            <div className="card p-4">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-ink-faint mb-3">Actual Ranking:</h3>
              <ol className="space-y-2">
                {data.result.real_ranking.map((faculty, idx) => (
                  <li key={faculty} className="flex items-center gap-3 rounded-lg bg-cream-100 p-3 text-sm">
                    <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-coral text-xs font-bold text-cream">
                      {idx + 1}
                    </span>
                    <span className="text-ink">{faculty}</span>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        ) : (
          <>
            <ul className="mt-6 space-y-2" role="list" aria-label="Drag to reorder faculties">
              {ranking.map((faculty, idx) => (
                <li
                  key={faculty}
                  draggable
                  onDragStart={() => handleDragStart(idx)}
                  onDragOver={(e) => handleDragOver(e, idx)}
                  onDragEnd={handleDragEnd}
                  className={`flex cursor-grab items-center gap-3 rounded-lg border p-3 text-sm transition-colors ${
                    dragIdx === idx ? "border-coral bg-coral-50" : "border-cream-300 bg-white hover:bg-cream-100"
                  }`}
                >
                  <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-cream-200 text-xs font-bold text-ink-muted">
                    {idx + 1}
                  </span>
                  <svg className="h-4 w-4 text-ink-ghost" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
                  </svg>
                  <span className="font-medium text-ink">{faculty}</span>
                </li>
              ))}
            </ul>

            <button
              type="button"
              className="btn-primary mt-6 w-full"
              onClick={handleSubmit}
              disabled={submitting}
            >
              {submitting ? "Submitting..." : "Submit Guess"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
