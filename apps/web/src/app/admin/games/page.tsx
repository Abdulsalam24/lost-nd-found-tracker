"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { api } from "@/lib/api";

const ghostHuntSchema = z.object({
  clue: z.string().min(10, "Clue must be at least 10 characters"),
  secret_code: z.string().min(3, "Secret code must be at least 3 characters"),
});

const triviaSchema = z.object({
  question: z.string().min(10, "Question must be at least 10 characters"),
  options: z.string().min(1, "Provide comma-separated options"),
  correct_answer: z.string().min(1, "Select the correct answer"),
  points: z.coerce.number().min(1).max(100),
});

type GhostHuntForm = z.infer<typeof ghostHuntSchema>;
type TriviaForm = z.infer<typeof triviaSchema>;

export default function AdminGamesPage() {
  const [ghostSuccess, setGhostSuccess] = useState(false);
  const [ghostError, setGhostError] = useState("");
  const [triviaSuccess, setTriviaSuccess] = useState(false);
  const [triviaError, setTriviaError] = useState("");

  const ghostForm = useForm<GhostHuntForm>({
    resolver: zodResolver(ghostHuntSchema),
  });

  const triviaForm = useForm<TriviaForm>({
    resolver: zodResolver(triviaSchema),
    defaultValues: { points: 10 },
  });

  const onGhostSubmit = async (data: GhostHuntForm) => {
    setGhostError("");
    setGhostSuccess(false);
    try {
      await api.post("/admin/games/ghost-hunt", data);
      setGhostSuccess(true);
      ghostForm.reset();
    } catch (err) {
      setGhostError(err instanceof Error ? err.message : "Failed to create ghost hunt");
    }
  };

  const onTriviaSubmit = async (data: TriviaForm) => {
    setTriviaError("");
    setTriviaSuccess(false);
    try {
      await api.post("/admin/games/trivia", {
        question: data.question,
        options: data.options.split(",").map((o) => o.trim()),
        correct_answer: data.correct_answer,
        points: data.points,
        type: "static",
      });
      setTriviaSuccess(true);
      triviaForm.reset();
    } catch (err) {
      setTriviaError(err instanceof Error ? err.message : "Failed to create question");
    }
  };

  return (
    <div className="space-y-10">
      <h1 className="section-title">Manage Games</h1>

      <section className="card p-6">
        <h2 className="text-lg font-bold text-ink">Create Ghost Hunt</h2>
        <p className="mt-1 text-xs text-ink-muted">Set up a new weekly ghost hunt challenge.</p>

        {ghostSuccess && (
          <div className="mt-3 rounded-lg bg-emerald-50 border border-emerald-200 p-3 text-xs text-emerald-700" role="alert">
            Ghost hunt created successfully!
          </div>
        )}
        {ghostError && (
          <div className="mt-3 rounded-lg bg-red-50 border border-red-200 p-3 text-xs text-red-600" role="alert">{ghostError}</div>
        )}

        <form onSubmit={ghostForm.handleSubmit(onGhostSubmit)} className="mt-4 space-y-4" noValidate>
          <div>
            <label htmlFor="gh-clue" className="label">Clue</label>
            <textarea id="gh-clue" rows={3} className="input-field" placeholder="Write the clue for this week..." {...ghostForm.register("clue")} />
            {ghostForm.formState.errors.clue && <p className="error-text">{ghostForm.formState.errors.clue.message}</p>}
          </div>
          <div>
            <label htmlFor="gh-code" className="label">Secret Code</label>
            <input id="gh-code" type="text" className="input-field" placeholder="The code hidden at the location" {...ghostForm.register("secret_code")} />
            {ghostForm.formState.errors.secret_code && <p className="error-text">{ghostForm.formState.errors.secret_code.message}</p>}
          </div>
          <button type="submit" className="btn-primary" disabled={ghostForm.formState.isSubmitting}>
            {ghostForm.formState.isSubmitting ? "Creating..." : "Create Ghost Hunt"}
          </button>
        </form>
      </section>

      <section className="card p-6">
        <h2 className="text-lg font-bold text-ink">Add Trivia Question</h2>
        <p className="mt-1 text-xs text-ink-muted">Add a static trivia question to the pool.</p>

        {triviaSuccess && (
          <div className="mt-3 rounded-lg bg-emerald-50 border border-emerald-200 p-3 text-xs text-emerald-700" role="alert">
            Question added successfully!
          </div>
        )}
        {triviaError && (
          <div className="mt-3 rounded-lg bg-red-50 border border-red-200 p-3 text-xs text-red-600" role="alert">{triviaError}</div>
        )}

        <form onSubmit={triviaForm.handleSubmit(onTriviaSubmit)} className="mt-4 space-y-4" noValidate>
          <div>
            <label htmlFor="tq-question" className="label">Question</label>
            <textarea id="tq-question" rows={2} className="input-field" placeholder="Enter the trivia question..." {...triviaForm.register("question")} />
            {triviaForm.formState.errors.question && <p className="error-text">{triviaForm.formState.errors.question.message}</p>}
          </div>
          <div>
            <label htmlFor="tq-options" className="label">Options (comma-separated)</label>
            <input id="tq-options" type="text" className="input-field" placeholder="Option A, Option B, Option C, Option D" {...triviaForm.register("options")} />
            {triviaForm.formState.errors.options && <p className="error-text">{triviaForm.formState.errors.options.message}</p>}
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="tq-answer" className="label">Correct Answer</label>
              <input id="tq-answer" type="text" className="input-field" placeholder="Must match one of the options" {...triviaForm.register("correct_answer")} />
              {triviaForm.formState.errors.correct_answer && <p className="error-text">{triviaForm.formState.errors.correct_answer.message}</p>}
            </div>
            <div>
              <label htmlFor="tq-points" className="label">Points</label>
              <input id="tq-points" type="number" className="input-field" min={1} max={100} {...triviaForm.register("points")} />
              {triviaForm.formState.errors.points && <p className="error-text">{triviaForm.formState.errors.points.message}</p>}
            </div>
          </div>
          <button type="submit" className="btn-primary" disabled={triviaForm.formState.isSubmitting}>
            {triviaForm.formState.isSubmitting ? "Adding..." : "Add Question"}
          </button>
        </form>
      </section>

      <section className="card p-6">
        <h2 className="text-lg font-bold text-ink">Detective Game</h2>
        <p className="mt-1 text-xs text-ink-muted">
          The detective game automatically generates weekly rankings from item data. No manual setup needed.
        </p>
        <div className="mt-4 flex items-center gap-2">
          <span className="badge-accent">Auto-managed</span>
        </div>
      </section>
    </div>
  );
}
