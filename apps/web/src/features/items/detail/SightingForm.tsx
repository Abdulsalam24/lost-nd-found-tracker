"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";

const schema = z.object({
  description: z.string().min(3, "Comment must be at least 3 characters"),
});

type FormData = z.infer<typeof schema>;

interface Comment {
  id: string;
  description: string;
  location?: { id: string; name: string } | null;
  spotted_at: string;
  created_at: string;
}

export function CommentSection({ itemId, reporterId }: { itemId: string; reporterId: string }) {
  const { user } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  useEffect(() => {
    api.get<Comment[]>(`/sightings/item/${itemId}`)
      .then(setComments)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [itemId]);

  const onSubmit = async (data: FormData) => {
    setError("");
    try {
      const saved = await api.post<Comment>("/sightings", {
        description: data.description,
        item_report_id: itemId,
        spotted_at: new Date().toISOString(),
      });
      setComments((prev) => [saved, ...prev]);
      reset();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to post comment");
    }
  };

  const isOwner = user?.id === reporterId;

  return (
    <div className="card p-4 sm:p-6">
      <div className="flex items-center gap-2">
        <svg className="h-4 w-4 text-text-ghost" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
        </svg>
        <h2 className="text-sm font-bold text-text">
          Comments {!loading && comments.length > 0 && `(${comments.length})`}
        </h2>
      </div>

      {/* Comment form */}
      {user && !isOwner && (
        <form onSubmit={handleSubmit(onSubmit)} className="mt-4" noValidate>
          {error && (
            <div className="mb-3 rounded-lg border border-red-500/30 bg-red-500/10 p-2.5 text-xs text-red-400" role="alert">
              {error}
            </div>
          )}
          <div className="flex gap-2">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent/10 text-[10px] font-bold text-accent">
              {user.name.charAt(0).toUpperCase()}
            </span>
            <div className="flex-1">
              <textarea
                rows={2}
                className="input-field text-xs"
                placeholder="Have info about this item? Leave a comment..."
                {...register("description")}
                aria-invalid={errors.description ? "true" : undefined}
              />
              {errors.description && <p className="error-text">{errors.description.message}</p>}
              <button type="submit" className="btn-primary mt-2 text-xs px-4 py-1.5" disabled={isSubmitting}>
                {isSubmitting ? "Posting..." : "Post Comment"}
              </button>
            </div>
          </div>
        </form>
      )}

      {!user && (
        <p className="mt-3 text-xs text-text-ghost">Log in to leave a comment.</p>
      )}

      {/* Comments list */}
      {loading ? (
        <div className="flex justify-center py-6">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-accent border-t-transparent" />
        </div>
      ) : comments.length === 0 ? (
        <p className="mt-4 text-xs text-text-ghost">No comments yet. Be the first to share info about this item.</p>
      ) : (
        <div className="mt-4 space-y-3">
          {comments.map((c) => (
            <div key={c.id} className="flex gap-2.5">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-bg-elevated text-[10px] font-bold text-text-muted">
                ?
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-text-secondary leading-relaxed">{c.description}</p>
                <p className="mt-1 text-[10px] text-text-ghost">
                  {c.created_at ? new Date(c.created_at).toLocaleString() : "_"}
                  {c.location?.name && ` \u00B7 ${c.location.name}`}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
