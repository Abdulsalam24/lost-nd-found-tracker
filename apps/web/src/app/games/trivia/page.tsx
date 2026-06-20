"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { TriviaLeaderboard } from "@/features/games/trivia/TriviaLeaderboard";
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

const TRIVIA_RULES = [
  { icon: "1", text: "Each week, trivia questions about campus life are posted." },
  { icon: "2", text: "Select one of the options for each question." },
  { icon: "3", text: "Earn points for correct answers. No penalty for wrong ones." },
  { icon: "4", text: "You can't change your answer once submitted." },
  { icon: "5", text: "Compete on the weekly leaderboard." },
];

export default function TriviaPage() {
  const { user, loading: authLoading } = useAuth();
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
  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
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
  }, [user]);

  const currentQuestion = questions[currentIndex];
  const answered = currentQuestion ? answers[currentQuestion.id] : undefined;
  const correctCount = Object.values(answers).filter((a) => a.result?.is_correct).length;

  const submitAnswer = async (questionId: string, answer: string) => {
    if (submitting || answered) return;
    setSelectedOption(answer);
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
        setToast("You already answered this question");
        setTimeout(() => setToast(""), 3000);
      } else {
        setError(msg);
      }
    } finally {
      setSubmitting(false);
      setSelectedOption(null);
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

  if (loading || authLoading) return <LoadingSpinner size="lg" />;

  // Not logged in
  if (!user) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16">
        <div className="text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-accent/10">
            <svg className="h-8 w-8 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <h1 className="mt-5 text-2xl font-bold text-text font-heading">Trivia Challenge</h1>
          <p className="mt-2 text-sm text-text-muted">Test your campus knowledge and earn points</p>
        </div>

        <div className="mt-8 card p-5 space-y-3">
          {TRIVIA_RULES.map((rule) => (
            <div key={rule.icon} className="flex items-start gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent/10 text-[11px] font-bold text-accent">
                {rule.icon}
              </span>
              <p className="text-sm text-text-secondary">{rule.text}</p>
            </div>
          ))}
        </div>

        <div className="mt-8 text-center">
          <Link href="/auth/login?redirect=/games/trivia" className="btn-primary">
            Sign in to play
          </Link>
        </div>
      </div>
    );
  }

  // No questions
  if (questions.length === 0) {
    return (
      <div className="mx-auto max-w-lg px-4 py-20 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-accent/10">
          <svg className="h-8 w-8 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
        </div>
        <h1 className="mt-5 text-xl font-bold text-text">No Questions This Week</h1>
        <p className="mt-2 text-sm text-text-muted">Check back soon for new trivia challenges!</p>
        <Link href="/games" className="btn-primary mt-6 inline-flex">Back to Games</Link>
      </div>
    );
  }

  // Summary
  if (showSummary) {
    const percentage = questions.length > 0 ? Math.round((correctCount / questions.length) * 100) : 0;
    return (
      <div className="mx-auto max-w-lg px-4 py-12">
        <div className="card p-8 text-center">
          <div className={`mx-auto flex h-20 w-20 items-center justify-center rounded-full ${
            percentage >= 70 ? "bg-emerald-500/10" : percentage >= 40 ? "bg-amber-500/10" : "bg-red-500/10"
          }`}>
            <span className="text-4xl">
              {percentage >= 70 ? "🎉" : percentage >= 40 ? "💪" : "📚"}
            </span>
          </div>
          <h1 className="mt-5 text-2xl font-bold text-text font-heading">
            {percentage >= 70 ? "Excellent!" : percentage >= 40 ? "Good effort!" : "Keep learning!"}
          </h1>
          <p className="mt-1 text-sm text-text-muted">You completed the trivia challenge</p>

          <div className="mt-8 grid grid-cols-3 gap-4">
            <div className="rounded-xl bg-bg-elevated p-4">
              <p className="text-2xl font-bold text-accent">{totalScore}</p>
              <p className="mt-0.5 text-[11px] text-text-muted">Points</p>
            </div>
            <div className="rounded-xl bg-bg-elevated p-4">
              <p className="text-2xl font-bold text-text">{correctCount}/{questions.length}</p>
              <p className="mt-0.5 text-[11px] text-text-muted">Correct</p>
            </div>
            <div className="rounded-xl bg-bg-elevated p-4">
              <p className={`text-2xl font-bold ${percentage >= 70 ? "text-emerald-500" : percentage >= 40 ? "text-amber-500" : "text-red-500"}`}>{percentage}%</p>
              <p className="mt-0.5 text-[11px] text-text-muted">Accuracy</p>
            </div>
          </div>

          <div className="mt-6">
            <Link href="/games" className="btn-primary text-xs">Back to Games</Link>
          </div>
        </div>

        {leaderboard.length > 0 && <TriviaLeaderboard entries={leaderboard} />}
      </div>
    );
  }

  // Main quiz
  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      {/* Top bar */}
      <div className="flex items-center justify-between">
        <Link href="/games" className="flex items-center gap-1.5 text-sm text-text-muted hover:text-text transition-colors">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </Link>
        <div className="flex items-center gap-1.5 rounded-full bg-accent/10 px-4 py-1.5">
          <svg className="h-4 w-4 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          <span className="text-sm font-bold text-accent">{totalScore} pts</span>
        </div>
      </div>

      {/* Progress */}
      <div className="mt-8">
        <div className="flex items-center justify-between text-sm mb-2">
          <span className="text-text-muted">
            Question <span className="font-semibold text-text">{currentIndex + 1}</span> of {questions.length}
          </span>
          <span className="text-text-muted">
            <span className="font-semibold text-emerald-500">{correctCount}</span> correct
          </span>
        </div>
        <div className="h-1.5 rounded-full bg-bg-elevated overflow-hidden">
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
                className={`h-2 w-2 rounded-full transition-all ${
                  i === currentIndex
                    ? "scale-150 bg-accent"
                    : a?.result?.is_correct
                    ? "bg-emerald-500"
                    : a?.result && !a.result.is_correct
                    ? "bg-red-500"
                    : "bg-bg-elevated"
                }`}
                aria-label={`Go to question ${i + 1}`}
              />
            );
          })}
        </div>
      </div>

      {error && (
        <div className="mt-4 rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-500" role="alert">{error}</div>
      )}

      {/* Question card */}
      <div className="mt-8 card overflow-hidden">
        <div className="p-6 sm:p-8">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-accent">
            Question {currentIndex + 1}
          </p>
          <h2 className="mt-2 text-lg font-bold text-text leading-relaxed sm:text-xl">
            {currentQuestion.question_text ?? "_"}
          </h2>

          <div className="mt-7 space-y-3">
            {currentQuestion.options.map((option, i) => {
              const isSelected = answered?.answer === option;
              const isCorrect = answered?.result?.is_correct && isSelected;
              const isWrong = answered?.result && !answered.result.is_correct && isSelected;
              const isActualCorrect = answered?.result && !answered.result.is_correct && currentQuestion.correct_answer === option;
              const isDisabled = !!answered || submitting;
              const isLoading = submitting && selectedOption === option;

              return (
                <button
                  key={option}
                  type="button"
                  disabled={isDisabled}
                  onClick={() => submitAnswer(currentQuestion.id, option)}
                  className={`group flex w-full items-center gap-4 rounded-xl border-2 px-5 py-4 text-left transition-all ${
                    isCorrect || isActualCorrect
                      ? "border-emerald-500/50 bg-emerald-500/10"
                      : isWrong
                      ? "border-red-500/50 bg-red-500/10"
                      : isDisabled
                      ? "border-border bg-bg-elevated/30 cursor-default"
                      : "border-border-light bg-bg-card hover:border-accent/40 hover:bg-accent/5 active:scale-[0.99]"
                  }`}
                >
                  <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-sm font-bold transition-colors ${
                    isCorrect || isActualCorrect
                      ? "bg-emerald-500/20 text-emerald-500"
                      : isWrong
                      ? "bg-red-500/20 text-red-500"
                      : isDisabled
                      ? "bg-bg-elevated text-text-ghost"
                      : "bg-bg-elevated text-text-muted group-hover:bg-accent/10 group-hover:text-accent"
                  }`}>
                    {OPTION_LETTERS[i]}
                  </span>
                  <span className={`flex-1 text-sm font-medium ${
                    isCorrect || isActualCorrect ? "text-emerald-500" : isWrong ? "text-red-500" : isDisabled ? "text-text-ghost" : "text-text"
                  }`}>
                    {option}
                  </span>
                  {isLoading && (
                    <div className="h-4 w-4 shrink-0 animate-spin rounded-full border-2 border-accent border-t-transparent" />
                  )}
                  {isCorrect && (
                    <svg className="h-5 w-5 shrink-0 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                  {isWrong && (
                    <svg className="h-5 w-5 shrink-0 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  )}
                  {isActualCorrect && !isCorrect && (
                    <span className="shrink-0 text-[10px] font-semibold text-emerald-500 uppercase tracking-wider">Correct</span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Feedback */}
          {answered?.result && (
            <div className={`mt-6 flex items-center gap-3 rounded-xl px-5 py-3.5 ${
              answered.alreadyAnswered
                ? "bg-amber-500/10 border border-amber-500/20"
                : answered.result.is_correct
                ? "bg-emerald-500/10 border border-emerald-500/20"
                : "bg-red-500/10 border border-red-500/20"
            }`}>
              {answered.alreadyAnswered ? (
                <span className="text-sm font-medium text-amber-500">Already answered — skipped</span>
              ) : answered.result.is_correct ? (
                <span className="text-sm font-medium text-emerald-500">
                  Correct! <span className="font-bold">+{answered.result.points_earned} points</span>
                </span>
              ) : (
                <span className="text-sm font-medium text-red-500">Wrong answer — better luck next time!</span>
              )}
            </div>
          )}
        </div>

        {/* Nav */}
        <div className="flex items-center justify-between border-t border-border px-6 py-4 sm:px-8">
          <button
            type="button"
            onClick={goBack}
            disabled={currentIndex === 0}
            className="flex items-center gap-1.5 text-sm font-medium text-text-muted transition-colors hover:text-text disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Previous
          </button>
          <button
            type="button"
            onClick={goNext}
            disabled={!answered}
            className={`flex items-center gap-1.5 rounded-xl px-6 py-2.5 text-sm font-semibold transition-all ${
              answered
                ? "bg-accent text-white hover:bg-accent-light"
                : "bg-bg-elevated text-text-ghost cursor-not-allowed"
            }`}
          >
            {currentIndex === questions.length - 1 ? "See Results" : "Next"}
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      {/* Leaderboard */}
      {leaderboard.length > 0 && <TriviaLeaderboard entries={leaderboard} />}

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 animate-slide-up">
          <div className="flex items-center gap-2 rounded-xl border border-amber-500/30 bg-amber-500/10 px-5 py-3 shadow-lg backdrop-blur-sm">
            <svg className="h-4 w-4 text-amber-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <span className="text-sm font-medium text-amber-500">{toast}</span>
          </div>
        </div>
      )}
    </div>
  );
}
