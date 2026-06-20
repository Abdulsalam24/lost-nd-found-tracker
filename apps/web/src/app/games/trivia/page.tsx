"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import Link from "next/link";

interface TriviaQuestion {
  id: string;
  question_text: string;
  options: string[];
  correct_answer?: string;
}

interface TriviaResult {
  is_correct: boolean;
  points_earned: number;
}

interface LeaderboardEntry {
  user_id: string;
  name: string | null;
  total_points: number;
}

const OPTION_LETTERS = ["A", "B", "C", "D"];

export default function TriviaPage() {
  const [questions, setQuestions] = useState<TriviaQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, { answer: string; result?: TriviaResult; alreadyAnswered?: boolean }>>({});
  const [totalScore, setTotalScore] = useState(0);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [showSummary, setShowSummary] = useState(false);
  const [toast, setToast] = useState("");

  useEffect(() => {
    Promise.all([
      api.get<TriviaQuestion[]>("/games/trivia/current"),
      api.get<LeaderboardEntry[]>("/games/trivia/leaderboard"),
    ])
      .then(([q, lb]) => {
        setQuestions(q);
        setLeaderboard(lb);
      })
      .catch(() => setError("Failed to load trivia"))
      .finally(() => setLoading(false));
  }, []);

  const currentQuestion = questions[currentIndex];
  const answered = currentQuestion ? answers[currentQuestion.id] : undefined;
  const answeredCount = Object.keys(answers).length;
  const correctCount = Object.values(answers).filter((a) => a.result?.is_correct).length;

  const submitAnswer = async (questionId: string, answer: string) => {
    if (submitting) return;
    setSubmitting(true);
    try {
      const result = await api.post<TriviaResult>("/games/trivia/answer", {
        question_id: questionId,
        answer,
      });
      setAnswers((prev) => ({ ...prev, [questionId]: { answer, result } }));
      if (result.is_correct) {
        setTotalScore((s) => s + result.points_earned);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to submit answer";
      if (msg.toLowerCase().includes("already answered")) {
        setAnswers((prev) => ({ ...prev, [questionId]: { answer, result: { is_correct: false, points_earned: 0 }, alreadyAnswered: true } }));
        setToast("You already answered this question before");
        setTimeout(() => setToast(""), 3000);
      } else {
        setError(msg);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const goNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((i) => i + 1);
    } else {
      setShowSummary(true);
    }
  };

  const goBack = () => {
    if (currentIndex > 0) setCurrentIndex((i) => i - 1);
  };

  if (loading) return <LoadingSpinner size="lg" />;

  if (questions.length === 0) {
    return (
      <div className="min-h-screen">
        <div className="mx-auto max-w-2xl px-4 py-16 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-accent/10">
            <svg className="h-8 w-8 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <h1 className="mt-4 text-xl font-bold text-text">No Questions This Week</h1>
          <p className="mt-2 text-xs text-text-muted">Check back soon for new trivia challenges!</p>
          <Link href="/games" className="btn-primary mt-6 inline-flex text-xs">Back to Games</Link>
        </div>
      </div>
    );
  }

  // Summary screen
  if (showSummary) {
    const percentage = questions.length > 0 ? Math.round((correctCount / questions.length) * 100) : 0;
    return (
      <div className="min-h-screen">
        <div className="mx-auto max-w-2xl px-4 py-12">
          <div className="card p-8 text-center">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-accent/10">
              {percentage >= 70 ? (
                <svg className="h-10 w-10 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              ) : (
                <svg className="h-10 w-10 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              )}
            </div>
            <h1 className="mt-4 text-2xl font-bold text-text">
              {percentage >= 70 ? "Great Job!" : percentage >= 40 ? "Not Bad!" : "Keep Trying!"}
            </h1>
            <p className="mt-2 text-text-muted">You completed the trivia challenge</p>

            <div className="mt-6 flex items-center justify-center gap-8">
              <div>
                <p className="text-3xl font-bold text-accent">{totalScore}</p>
                <p className="text-xs text-text-muted">Points Earned</p>
              </div>
              <div className="h-10 w-px bg-border" />
              <div>
                <p className="text-3xl font-bold text-text">{correctCount}/{questions.length}</p>
                <p className="text-xs text-text-muted">Correct</p>
              </div>
              <div className="h-10 w-px bg-border" />
              <div>
                <p className="text-3xl font-bold text-text">{percentage}%</p>
                <p className="text-xs text-text-muted">Accuracy</p>
              </div>
            </div>

            <div className="mt-6 flex justify-center gap-3">
              <button
                type="button"
                className="rounded-xl border border-border-light bg-bg-elevated px-5 py-2.5 text-xs font-medium text-text transition-colors hover:bg-bg-hover"
                onClick={() => { setShowSummary(false); setCurrentIndex(0); }}
              >
                Review Answers
              </button>
              <Link href="/games" className="btn-primary text-xs">Back to Games</Link>
            </div>
          </div>

          {/* Leaderboard in summary */}
          {leaderboard.length > 0 && <Leaderboard entries={leaderboard} />}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-2xl px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Link href="/games" className="flex items-center gap-1 text-xs text-text-muted hover:text-accent transition-colors">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Games
          </Link>
          <div className="flex items-center gap-2 rounded-full border border-accent/20 bg-accent/5 px-4 py-1.5">
            <svg className="h-4 w-4 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <span className="text-xs font-bold text-accent">{totalScore} pts</span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-6">
          <div className="flex items-center justify-between text-xs text-text-muted mb-2">
            <span>Question {currentIndex + 1} of {questions.length}</span>
            <span>{correctCount} correct</span>
          </div>
          <div className="h-2 rounded-full bg-bg-elevated overflow-hidden">
            <div
              className="h-full rounded-full bg-accent transition-all duration-500 ease-out"
              style={{ width: `${((currentIndex + (answered ? 1 : 0)) / questions.length) * 100}%` }}
            />
          </div>
          {/* Question dots */}
          <div className="mt-3 flex gap-1.5 justify-center flex-wrap">
            {questions.map((q, i) => {
              const a = answers[q.id];
              return (
                <button
                  key={q.id}
                  type="button"
                  onClick={() => setCurrentIndex(i)}
                  className={`h-2.5 w-2.5 rounded-full transition-all ${
                    i === currentIndex
                      ? "scale-125 bg-accent"
                      : a?.result?.is_correct
                      ? "bg-emerald-400"
                      : a?.result && !a.result.is_correct
                      ? "bg-red-400"
                      : "bg-bg-elevated"
                  }`}
                  aria-label={`Go to question ${i + 1}`}
                />
              );
            })}
          </div>
        </div>

        {error && (
          <div className="mt-4 rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-xs text-red-400" role="alert">{error}</div>
        )}

        {/* Question card */}
        <div className="mt-6 card overflow-hidden">
          <div className="border-b border-border bg-bg-elevated/50 px-6 py-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-text-muted">
              Question {currentIndex + 1}
            </span>
          </div>
          <div className="p-6">
            <h2 className="text-lg font-bold text-text leading-relaxed">
              {currentQuestion.question_text ?? "_"}
            </h2>

            <div className="mt-6 space-y-3">
              {currentQuestion.options.map((option, i) => {
                const isSelected = answered?.answer === option;
                const isCorrect = answered?.result?.is_correct && isSelected;
                const isWrong = answered?.result && !answered.result.is_correct && isSelected;
                const isDisabled = !!answered || submitting;

                return (
                  <button
                    key={option}
                    type="button"
                    disabled={isDisabled}
                    onClick={() => submitAnswer(currentQuestion.id, option)}
                    className={`group flex w-full items-center gap-4 rounded-xl border-2 px-4 py-3.5 text-left text-xs font-medium transition-all ${
                      isCorrect
                        ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-400"
                        : isWrong
                        ? "border-red-500/40 bg-red-500/10 text-red-400"
                        : isDisabled
                        ? "border-border bg-bg-elevated/30 text-text-ghost cursor-not-allowed"
                        : "border-border-light bg-bg-card text-text hover:border-accent/40 hover:bg-accent/5"
                    }`}
                  >
                    <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs font-bold transition-colors ${
                      isCorrect
                        ? "bg-emerald-500/20 text-emerald-400"
                        : isWrong
                        ? "bg-red-500/20 text-red-400"
                        : isDisabled
                        ? "bg-bg-elevated text-text-ghost"
                        : "bg-bg-elevated text-text-muted group-hover:bg-accent/10 group-hover:text-accent"
                    }`}>
                      {OPTION_LETTERS[i]}
                    </span>
                    <span className="flex-1">{option}</span>
                    {isCorrect && (
                      <svg className="h-5 w-5 shrink-0 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                    {isWrong && (
                      <svg className="h-5 w-5 shrink-0 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Result feedback */}
            {answered?.result && (
              <div className={`mt-5 flex items-center gap-3 rounded-xl px-4 py-3 ${
                answered.alreadyAnswered
                  ? "bg-yellow-500/10 border border-yellow-500/20"
                  : answered.result.is_correct
                  ? "bg-emerald-500/10 border border-emerald-500/20"
                  : "bg-red-500/10 border border-red-500/20"
              }`}>
                {answered.alreadyAnswered ? (
                  <span className="text-xs font-semibold text-yellow-400">You already answered this one — skipped!</span>
                ) : answered.result.is_correct ? (
                  <>
                    <span className="text-lg">+{answered.result.points_earned}</span>
                    <span className="text-xs font-semibold text-emerald-400">Correct! Points earned.</span>
                  </>
                ) : (
                  <span className="text-xs font-semibold text-red-400">Incorrect. Better luck next time!</span>
                )}
              </div>
            )}
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between border-t border-border px-6 py-4">
            <button
              type="button"
              onClick={goBack}
              disabled={currentIndex === 0}
              className="flex items-center gap-1 text-xs font-medium text-text-muted transition-colors hover:text-text disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Previous
            </button>
            <button
              type="button"
              onClick={goNext}
              disabled={!answered}
              className={`flex items-center gap-1 rounded-xl px-5 py-2 text-xs font-medium transition-all ${
                answered
                  ? "bg-accent text-bg hover:bg-accent-light"
                  : "bg-bg-elevated text-text-ghost cursor-not-allowed"
              }`}
            >
              {currentIndex === questions.length - 1 ? "See Results" : "Next"}
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>

        {/* Leaderboard below questions */}
        {leaderboard.length > 0 && <Leaderboard entries={leaderboard} />}
      </div>

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 animate-slide-up">
          <div className="flex items-center gap-3 rounded-xl border border-yellow-500/30 bg-yellow-950/90 px-4 py-3 shadow-lg backdrop-blur-sm">
            <span className="text-xs font-medium text-yellow-200">{toast}</span>
          </div>
        </div>
      )}
    </div>
  );
}

function Leaderboard({ entries }: { entries: LeaderboardEntry[] }) {
  const champion = entries[0];
  const rest = entries.slice(1);

  return (
    <div className="mt-8">
      <h2 className="text-lg font-bold text-text">Leaderboard</h2>
      <p className="mt-1 text-xs text-text-muted">All players who took the trivia challenge</p>

      {/* Champion card */}
      {champion && (
        <div className="mt-4 card overflow-hidden border border-yellow-500/20">
          <div className="bg-gradient-to-r from-yellow-500/10 via-yellow-500/5 to-transparent px-5 py-4">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-yellow-500/15 text-3xl">
                👑
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-yellow-500/70">Current Champion</p>
                <p className="mt-0.5 text-lg font-bold text-text truncate">
                  {champion.name || champion.user_id.slice(0, 8)}
                </p>
                {!champion.name && (
                  <p className="text-[10px] text-text-ghost">Anonymous player</p>
                )}
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-yellow-400">{champion.total_points}</p>
                <p className="text-[10px] text-text-muted">points</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Rest of leaderboard */}
      {rest.length > 0 && (
        <div className="mt-3 space-y-2">
          {rest.map((entry, i) => {
            const rank = i + 2;
            const displayName = entry.name || entry.user_id.slice(0, 8);

            return (
              <div
                key={entry.user_id}
                className={`card flex items-center gap-4 p-4 ${
                  rank <= 3 ? "border border-border-light" : ""
                }`}
              >
                {rank === 2 ? (
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center text-xl">🥈</span>
                ) : rank === 3 ? (
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center text-xl">🥉</span>
                ) : (
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-bg-elevated text-xs font-bold text-text-muted">
                    {rank}
                  </span>
                )}
                <div className="flex-1 min-w-0">
                  <p className={`font-semibold truncate ${rank <= 3 ? "text-text" : "text-text-secondary"}`}>
                    {displayName}
                  </p>
                  {!entry.name && (
                    <p className="text-[10px] text-text-ghost">Anonymous player</p>
                  )}
                </div>
                <span className={`text-xs font-bold ${rank <= 3 ? "text-accent" : "text-text-muted"}`}>
                  {entry.total_points} pts
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
