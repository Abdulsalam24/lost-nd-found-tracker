"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
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

const RULES = [
  { icon: "1", text: "Each week, a secret item is hidden somewhere on campus by the admin." },
  { icon: "2", text: "A clue is posted here describing the item's location." },
  { icon: "3", text: "Go to the location and find the item — it has a secret code attached." },
  { icon: "4", text: "Enter the secret code below. First person to submit the correct code wins!" },
  { icon: "5", text: "The winner earns bonus points and bragging rights for the week." },
];

export default function GhostHuntPage() {
  const [data, setData] = useState<GhostHuntData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [showRules, setShowRules] = useState(false);

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
      .catch(() => {})
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
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              Ghost Hunt
            </h1>
            <p className="section-subtitle mt-1">Find the hidden item on campus!</p>
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
            <h3 className="text-xs font-bold text-text">How Ghost Hunt Works</h3>
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

        {!data ? (
          <div className="mt-6 card p-10 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-accent/10">
              <svg className="h-7 w-7 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="mt-3 font-semibold text-text">No Active Hunt</p>
            <p className="mt-1 text-xs text-text-muted">Check back soon — a new ghost hunt starts every week!</p>
          </div>
        ) : (
          <>
            {/* Clue card */}
            <div className="mt-6 card overflow-hidden">
              <div className="border-b border-border bg-bg-elevated/50 px-5 py-3 flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-text-muted">This Week&apos;s Clue</span>
                <span className="text-xs text-text-ghost">Week: {data.week ?? "_"}</span>
              </div>
              <div className="p-5">
                <p className="text-lg font-medium text-text leading-relaxed">&ldquo;{data.clue ?? "_"}&rdquo;</p>
              </div>
            </div>

            {error && (
              <div className="mt-4 rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-xs text-red-400" role="alert">{error}</div>
            )}

            {success ? (
              <div className="mt-6 card p-8 text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10">
                  <svg className="h-8 w-8 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="mt-3 text-xl font-bold text-text">You found it!</p>
                <p className="mt-1 text-xs text-text-muted">Congratulations, you claimed the ghost item! Points have been added to your account.</p>
              </div>
            ) : data.claimed ? (
              <div className="mt-6 card p-8 text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-yellow-500/10">
                  <span className="text-3xl">🏆</span>
                </div>
                <p className="mt-3 text-lg font-bold text-text">Already Claimed!</p>
                {data.winner && (
                  <p className="mt-1 text-xs text-text-muted">
                    Won by <span className="font-semibold text-accent">{data.winner.name ?? "_"}</span> on{" "}
                    {data.winner.claimed_at ? new Date(data.winner.claimed_at).toLocaleDateString() : "_"}
                  </p>
                )}
                <p className="mt-3 text-xs text-text-ghost">A new hunt starts next week!</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="mt-6 card p-6 space-y-4" noValidate>
                <div>
                  <label htmlFor="secret_code" className="label">Secret Code</label>
                  <p className="text-xs text-text-ghost mt-0.5">Found the item? Enter the code attached to it.</p>
                  <input
                    id="secret_code"
                    type="text"
                    className="input-field mt-2"
                    placeholder="e.g. GHOST-ABCD-1234"
                    {...register("secret_code")}
                  />
                  {errors.secret_code && <p className="error-text">{errors.secret_code.message}</p>}
                </div>
                <button type="submit" className="btn-primary w-full" disabled={isSubmitting}>
                  {isSubmitting ? "Checking..." : "Submit Code"}
                </button>
              </form>
            )}
          </>
        )}
      </div>
    </div>
  );
}
