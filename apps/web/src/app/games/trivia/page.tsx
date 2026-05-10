"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { LoadingSpinner } from "@/components/LoadingSpinner";

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
  user_name: string;
  points: number;
  rank: number;
}

export default function TriviaPage() {
  const [questions, setQuestions] = useState<TriviaQuestion[]>([]);
  const [answers, setAnswers] = useState<Record<string, { answer: string; result?: TriviaResult }>>({});
  const [totalScore, setTotalScore] = useState(0);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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

  const submitAnswer = async (questionId: string, answer: string) => {
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
      setError(err instanceof Error ? err.message : "Failed to submit answer");
    }
  };

  if (loading) return <LoadingSpinner size="lg" />;

  return (
    <div className="min-h-screen bg-cream">
      <div className="mx-auto max-w-3xl px-4 py-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="section-title">Trivia Challenge</h1>
            <p className="section-subtitle">Answer questions about campus lost and found.</p>
          </div>
          <div className="card px-4 py-2">
            <p className="text-xs font-semibold uppercase tracking-wider text-ink-faint">Score</p>
            <p className="text-xl font-bold text-coral">{totalScore}</p>
          </div>
        </div>

        {error && (
          <div className="mt-4 rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-600" role="alert">{error}</div>
        )}

        {questions.length > 0 ? (
          <ol className="mt-6 space-y-6">
            {questions.map((q, idx) => {
              const answered = answers[q.id];
              return (
                <li key={q.id} className="card p-5">
                  <div className="flex items-start justify-between">
                    <p className="text-sm font-bold text-ink">
                      {idx + 1}. {q.question_text ?? "_"}
                    </p>
                    <span className="ml-2 shrink-0 text-xs text-ink-faint">10 pts</span>
                  </div>
                  <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
                    {q.options.map((option) => {
                      const isSelected = answered?.answer === option;
                      const showCorrect = answered?.result?.is_correct && isSelected;
                      const showWrong = answered?.result && !answered.result.is_correct && isSelected;

                      return (
                        <button
                          key={option}
                          type="button"
                          disabled={!!answered}
                          onClick={() => submitAnswer(q.id, option)}
                          className={`rounded-full border px-4 py-2 text-left text-sm transition-colors ${
                            showCorrect
                              ? "border-emerald-300 bg-emerald-50 text-emerald-700"
                              : showWrong
                              ? "border-red-300 bg-red-50 text-red-600"
                              : answered
                              ? "border-cream-300 bg-cream-100 text-ink-ghost cursor-not-allowed"
                              : "border-cream-300 bg-white text-ink hover:border-coral hover:bg-coral-50"
                          }`}
                        >
                          {option}
                        </button>
                      );
                    })}
                  </div>
                  {answered?.result && (
                    <p className={`mt-2 text-xs font-semibold ${answered.result.is_correct ? "text-emerald-600" : "text-red-500"}`}>
                      {answered.result.is_correct ? `Correct! +${answered.result.points_earned} points` : "Incorrect"}
                    </p>
                  )}
                </li>
              );
            })}
          </ol>
        ) : (
          <p className="mt-6 text-center text-ink-muted">No trivia questions available this week.</p>
        )}

        {leaderboard.length > 0 && (
          <div className="mt-10">
            <h2 className="text-lg font-bold text-ink">Weekly Leaderboard</h2>
            <div className="mt-4 card overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="table-header">
                    <th scope="col" className="px-4 py-2 text-left font-semibold text-ink-faint">Rank</th>
                    <th scope="col" className="px-4 py-2 text-left font-semibold text-ink-faint">Player</th>
                    <th scope="col" className="px-4 py-2 text-right font-semibold text-ink-faint">Points</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-cream-200">
                  {leaderboard.map((entry) => (
                    <tr key={entry.rank} className="table-row">
                      <td className="px-4 py-2 font-medium text-ink-muted">{entry.rank ?? "_"}</td>
                      <td className="px-4 py-2 text-ink">{entry.user_name ?? "_"}</td>
                      <td className="px-4 py-2 text-right font-bold text-coral">{entry.points ?? "_"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
