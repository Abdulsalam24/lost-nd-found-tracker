"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { api } from "@/lib/api";

interface LocationOption {
  id: string;
  name: string;
}

const ghostHuntSchema = z.object({
  clue_text: z.string().min(10, "Clue must be at least 10 characters"),
  secret_code: z.string().min(4, "Secret code must be at least 4 characters"),
  location_id: z.string().min(1, "Select a location"),
});

const triviaSchema = z.object({
  question_text: z.string().min(10, "Question must be at least 10 characters"),
  options: z.string().min(1, "Provide comma-separated options"),
  correct_answer: z.string().min(1, "Enter the correct answer"),
});

type GhostHuntForm = z.infer<typeof ghostHuntSchema>;
type TriviaForm = z.infer<typeof triviaSchema>;

function getCurrentWeekStart(): string {
  const now = new Date();
  const day = now.getDay();
  const diff = now.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(now);
  monday.setDate(diff);
  return monday.toISOString().split("T")[0];
}

export default function AdminGamesPage() {
  const [ghostSuccess, setGhostSuccess] = useState(false);
  const [ghostError, setGhostError] = useState("");
  const [triviaSuccess, setTriviaSuccess] = useState(false);
  const [triviaError, setTriviaError] = useState("");
  const [locations, setLocations] = useState<LocationOption[]>([]);

  useEffect(() => {
    api.get<LocationOption[]>("/items/locations").then(setLocations).catch(() => {});
  }, []);

  const ghostForm = useForm<GhostHuntForm>({
    resolver: zodResolver(ghostHuntSchema),
  });

  const triviaForm = useForm<TriviaForm>({
    resolver: zodResolver(triviaSchema),
  });

  const onGhostSubmit = async (data: GhostHuntForm) => {
    setGhostError("");
    setGhostSuccess(false);
    try {
      await api.post("/admin/games/ghost-hunt", {
        ...data,
        week_of: getCurrentWeekStart(),
      });
      setGhostSuccess(true);
      ghostForm.reset();
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? err?.message ?? "Failed to create ghost hunt";
      setGhostError(Array.isArray(msg) ? msg.join(", ") : msg);
    }
  };

  const onTriviaSubmit = async (data: TriviaForm) => {
    setTriviaError("");
    setTriviaSuccess(false);
    try {
      const options = data.options.split(",").map((o) => o.trim()).filter(Boolean);
      if (!options.includes(data.correct_answer)) {
        setTriviaError("Correct answer must match one of the options exactly");
        return;
      }
      await api.post("/admin/games/trivia", {
        question_text: data.question_text,
        options,
        correct_answer: data.correct_answer,
      });
      setTriviaSuccess(true);
      triviaForm.reset();
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? err?.message ?? "Failed to create question";
      setTriviaError(Array.isArray(msg) ? msg.join(", ") : msg);
    }
  };

  return (
    <div className="space-y-8">
      {/* Ghost Hunt */}
      <section className="card p-6">
        <h2 className="text-lg font-bold text-text">Create Ghost Hunt</h2>
        <p className="mt-1 text-xs text-text-muted">Set up a new weekly ghost hunt challenge.</p>

        {ghostSuccess && (
          <div className="mt-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 p-3 text-xs text-emerald-400" role="alert">
            Ghost hunt created successfully!
          </div>
        )}
        {ghostError && (
          <div className="mt-3 rounded-lg bg-red-500/10 border border-red-500/20 p-3 text-xs text-red-400" role="alert">{ghostError}</div>
        )}

        <form onSubmit={ghostForm.handleSubmit(onGhostSubmit)} className="mt-4 space-y-4" noValidate>
          <div>
            <label htmlFor="gh-clue" className="label">Clue</label>
            <textarea id="gh-clue" rows={3} className="input-field" placeholder="Write the clue for this week..." {...ghostForm.register("clue_text")} />
            {ghostForm.formState.errors.clue_text && <p className="error-text">{ghostForm.formState.errors.clue_text.message}</p>}
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="gh-location" className="label">Location</label>
              <select id="gh-location" className="input-field" {...ghostForm.register("location_id")}>
                <option value="">Select location</option>
                {locations.map((loc) => (
                  <option key={loc.id} value={loc.id}>{loc.name}</option>
                ))}
              </select>
              {ghostForm.formState.errors.location_id && <p className="error-text">{ghostForm.formState.errors.location_id.message}</p>}
            </div>
            <div>
              <label htmlFor="gh-code" className="label">Secret Code</label>
              <input id="gh-code" type="text" className="input-field" placeholder="e.g. GHOST-ABCD-1234" {...ghostForm.register("secret_code")} />
              {ghostForm.formState.errors.secret_code && <p className="error-text">{ghostForm.formState.errors.secret_code.message}</p>}
            </div>
          </div>
          <button type="submit" className="btn-primary" disabled={ghostForm.formState.isSubmitting}>
            {ghostForm.formState.isSubmitting ? "Creating..." : "Create Ghost Hunt"}
          </button>
        </form>
      </section>

      {/* Trivia */}
      <section className="card p-6">
        <h2 className="text-lg font-bold text-text">Add Trivia Question</h2>
        <p className="mt-1 text-xs text-text-muted">Add a question to the trivia pool.</p>

        {triviaSuccess && (
          <div className="mt-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 p-3 text-xs text-emerald-400" role="alert">
            Question added successfully!
          </div>
        )}
        {triviaError && (
          <div className="mt-3 rounded-lg bg-red-500/10 border border-red-500/20 p-3 text-xs text-red-400" role="alert">{triviaError}</div>
        )}

        <form onSubmit={triviaForm.handleSubmit(onTriviaSubmit)} className="mt-4 space-y-4" noValidate>
          <div>
            <label htmlFor="tq-question" className="label">Question</label>
            <textarea id="tq-question" rows={2} className="input-field" placeholder="Enter the trivia question..." {...triviaForm.register("question_text")} />
            {triviaForm.formState.errors.question_text && <p className="error-text">{triviaForm.formState.errors.question_text.message}</p>}
          </div>
          <div>
            <label htmlFor="tq-options" className="label">Options (comma-separated)</label>
            <input id="tq-options" type="text" className="input-field" placeholder="Option A, Option B, Option C, Option D" {...triviaForm.register("options")} />
            {triviaForm.formState.errors.options && <p className="error-text">{triviaForm.formState.errors.options.message}</p>}
          </div>
          <div>
            <label htmlFor="tq-answer" className="label">Correct Answer</label>
            <input id="tq-answer" type="text" className="input-field" placeholder="Must match one of the options exactly" {...triviaForm.register("correct_answer")} />
            {triviaForm.formState.errors.correct_answer && <p className="error-text">{triviaForm.formState.errors.correct_answer.message}</p>}
          </div>
          <button type="submit" className="btn-primary" disabled={triviaForm.formState.isSubmitting}>
            {triviaForm.formState.isSubmitting ? "Adding..." : "Add Question"}
          </button>
        </form>
      </section>

      {/* Detective */}
      <section className="card p-6">
        <h2 className="text-lg font-bold text-text">Detective Game</h2>
        <p className="mt-1 text-xs text-text-muted">
          Automatically generates weekly rankings from item data. No manual setup needed.
        </p>
        <div className="mt-4">
          <span className="badge-accent">Auto-managed</span>
        </div>
      </section>
    </div>
  );
}
