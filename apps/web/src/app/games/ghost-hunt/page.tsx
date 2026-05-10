"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

interface GhostHuntData {
  id: string;
  week: string;
  clue: string;
  claimed: boolean;
  winner?: { name: string; claimed_at: string };
}

const schema = z.object({
  secret_code: z.string().min(1, "Enter the secret code"),
});

type FormData = z.infer<typeof schema>;

export default function GhostHuntPage() {
  const [data, setData] = useState<GhostHuntData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  useEffect(() => {
    api.get<GhostHuntData>("/games/ghost-hunt/current")
      .then(setData)
      .catch(() => setError("Failed to load game data"))
      .finally(() => setLoading(false));
  }, []);

  const onSubmit = async (formData: FormData) => {
    setError("");
    try {
      await api.post("/games/ghost-hunt/claim", { secret_code: formData.secret_code });
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Wrong code or already claimed");
    }
  };

  if (loading) return <LoadingSpinner size="lg" />;

  return (
    <div className="min-h-screen bg-cream">
      <div className="mx-auto max-w-2xl px-4 py-8">
        <h1 className="section-title">Ghost Hunt</h1>
        <p className="section-subtitle">
          Find the hidden item on campus using the clue below. Enter the secret code to claim victory!
        </p>

        {!data ? (
          <div className="mt-6 card p-6 text-center">
            <p className="text-ink-muted">No active ghost hunt this week. Check back later!</p>
          </div>
        ) : (
          <>
            <div className="mt-6 card p-6">
              <div className="flex items-center justify-between text-sm">
                <span className="font-semibold text-ink">Week: {data.week ?? "_"}</span>
              </div>
              <div className="mt-4 rounded-lg bg-cream-100 border border-cream-300 p-4">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-coral">This Week&apos;s Clue</h3>
                <p className="mt-2 text-lg text-ink">{data.clue ?? "_"}</p>
              </div>
            </div>

            {error && (
              <div className="mt-4 rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-600" role="alert">{error}</div>
            )}

            {success ? (
              <div className="mt-6 card p-6 text-center">
                <svg className="mx-auto h-12 w-12 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="mt-2 text-lg font-bold text-ink">You found it!</p>
                <p className="text-sm text-ink-muted">Congratulations, you claimed the ghost item!</p>
              </div>
            ) : data.claimed ? (
              <div className="mt-6 card p-6 text-center">
                <p className="text-lg font-bold text-ink">Already Claimed!</p>
                {data.winner && (
                  <p className="mt-1 text-sm text-ink-muted">
                    Won by <span className="font-semibold text-coral">{data.winner.name ?? "_"}</span> on{" "}
                    {data.winner.claimed_at ? new Date(data.winner.claimed_at).toLocaleDateString() : "_"}
                  </p>
                )}
              </div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="mt-6 card p-6 space-y-4" noValidate>
                <div>
                  <label htmlFor="secret_code" className="label">Secret Code</label>
                  <input
                    id="secret_code"
                    type="text"
                    className="input-field"
                    placeholder="Enter the code you found..."
                    {...register("secret_code")}
                  />
                  {errors.secret_code && <p className="error-text">{errors.secret_code.message}</p>}
                </div>
                <button type="submit" className="btn-primary w-full" disabled={isSubmitting}>
                  {isSubmitting ? "Checking..." : "Submit Claim"}
                </button>
              </form>
            )}
          </>
        )}
      </div>
    </div>
  );
}
