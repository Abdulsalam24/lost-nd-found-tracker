"use client";

import { useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";

const QUICK_LINKS = [
  { href: "/items", label: "Browse Items" },
  { href: "/stats", label: "Statistics" },
  { href: "/games", label: "Games" },
  { href: "/leaderboard", label: "Leaderboard" },
];

const STAR_COUNT = 5;

export function Footer() {
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim().length < 5) {
      setError("Please write at least 5 characters.");
      return;
    }
    setError("");
    setSubmitting(true);
    try {
      await api.post("/feedback", {
        message: message.trim(),
        ...(rating > 0 ? { rating } : {}),
      });
      setSubmitted(true);
      setMessage("");
      setRating(0);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send feedback");
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setSubmitted(false);
    setError("");
    setMessage("");
    setRating(0);
  };

  return (
    <footer className="relative z-10 border-t border-border bg-bg/80 backdrop-blur-sm">
      <div className="mx-auto max-w-7xl px-5 py-12 pb-[90px] md:px-10">
        <div className="flex flex-col gap-8 sm:flex-row sm:justify-between">
          <div className="flex flex-col gap-3">
            <span className="text-lg font-bold text-text">Lost & Found</span>
            <p className="text-xs text-text-muted">University of Ilorin Campus</p>
          </div>

          <nav aria-label="Footer navigation">
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-widest text-text-ghost">
              Quick Links
            </h3>
            <ul className="flex flex-col gap-2">
              {QUICK_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-xs text-text-secondary transition-colors hover:text-accent"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Feedback section */}
          <div className="max-w-xs">
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-widest text-text-ghost">
              Feedback
            </h3>
            {!feedbackOpen && !submitted ? (
              <button
                type="button"
                onClick={() => setFeedbackOpen(true)}
                className="flex items-center gap-2 rounded-xl border border-border-light bg-bg-card/60 px-4 py-2.5 text-xs text-text-secondary transition-all hover:border-accent/30 hover:text-text"
              >
                <svg className="h-4 w-4 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
                Send us feedback
              </button>
            ) : submitted ? (
              <div className="rounded-xl border border-accent/20 bg-accent/5 p-4">
                <p className="text-xs font-medium text-accent">Thanks for your feedback!</p>
                <p className="mt-1 text-xs text-text-muted">We&apos;ll review it shortly.</p>
                <button
                  type="button"
                  onClick={resetForm}
                  className="mt-3 text-xs font-medium text-accent hover:text-accent-light transition-colors"
                >
                  Send another
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-3">
                {/* Star rating */}
                <div>
                  <p className="mb-1.5 text-xs text-text-muted">How&apos;s your experience?</p>
                  <div className="flex gap-1">
                    {Array.from({ length: STAR_COUNT }).map((_, i) => {
                      const starValue = i + 1;
                      const filled = starValue <= (hoverRating || rating);
                      return (
                        <button
                          key={i}
                          type="button"
                          onClick={() => setRating(starValue)}
                          onMouseEnter={() => setHoverRating(starValue)}
                          onMouseLeave={() => setHoverRating(0)}
                          className="transition-transform hover:scale-110"
                          aria-label={`Rate ${starValue} star${starValue > 1 ? "s" : ""}`}
                        >
                          <svg
                            className={`h-5 w-5 transition-colors ${filled ? "text-amber-400" : "text-text-ghost"}`}
                            fill={filled ? "currentColor" : "none"}
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            aria-hidden="true"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                          </svg>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Message */}
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Tell us what you think..."
                  rows={3}
                  className="input-field text-xs"
                  maxLength={1000}
                />

                {error && <p className="text-xs text-red-400">{error}</p>}

                <div className="flex items-center gap-2">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="rounded-lg bg-accent px-3.5 py-1.5 text-xs font-semibold text-bg transition-colors hover:bg-accent-light disabled:opacity-50"
                  >
                    {submitting ? "Sending..." : "Send"}
                  </button>
                  <button
                    type="button"
                    onClick={() => { setFeedbackOpen(false); resetForm(); }}
                    className="rounded-lg px-3.5 py-1.5 text-xs font-medium text-text-muted transition-colors hover:text-text"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

        <div className="my-8 border-t border-border" />

        <div className="flex flex-col items-center gap-2 sm:flex-row sm:justify-between">
          <p className="text-xs text-text-ghost">
            &copy; {new Date().getFullYear()} UniLorin Lost &amp; Found
          </p>
          <p className="text-xs text-text-ghost">University of Ilorin</p>
        </div>
      </div>
    </footer>
  );
}
