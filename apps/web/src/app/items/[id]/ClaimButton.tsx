"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/lib/auth";
import { api } from "@/lib/api";
import { Modal } from "@/components/Modal";

const schema = z.object({
  evidence_description: z.string().min(10, "Provide at least 10 characters of evidence"),
});

type FormData = z.infer<typeof schema>;

export function ClaimButton({ itemId, itemStatus }: { itemId: string; itemStatus: string }) {
  const { user } = useAuth();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [error, setError] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const handleImageChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setImageFile(file);
  }, []);

  if (itemStatus === "RECOVERED" || itemStatus === "DISPOSED") return null;

  const onSubmit = async (data: FormData) => {
    setError("");
    try {
      const claim = await api.post<{ id: string }>("/claims", {
        item_report_id: itemId,
        evidence_description: data.evidence_description,
      });

      if (imageFile && claim.id) {
        const formData = new FormData();
        formData.append("file", imageFile);
        await api.upload(`/claims/${claim.id}/evidence-image`, formData);
      }

      setOpen(false);
      router.push(`/claims/${claim.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit claim");
    }
  };

  if (!user) {
    return (
      <div className="card p-6 text-center">
        <p className="text-sm text-ink-muted">Log in to claim this item.</p>
        <a
          href={`/auth/login?redirect=/items/${itemId}`}
          className="btn-primary mt-4 inline-flex text-sm"
        >
          Login to Claim
        </a>
      </div>
    );
  }

  return (
    <>
      <div className="card p-6">
        <button
          type="button"
          className="btn-primary w-full"
          onClick={() => setOpen(true)}
        >
          Claim This Item
        </button>
        <p className="mt-3 text-xs text-center text-ink-faint">
          You&apos;ll need to provide evidence of ownership.
        </p>
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title="Claim This Item">
        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600" role="alert">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <div>
            <label htmlFor="evidence" className="label">Evidence of Ownership</label>
            <textarea
              id="evidence"
              rows={4}
              className="input-field"
              placeholder="Describe unique details only the owner would know..."
              {...register("evidence_description")}
              aria-invalid={errors.evidence_description ? "true" : undefined}
              aria-describedby={errors.evidence_description ? "evidence-error" : undefined}
            />
            {errors.evidence_description && (
              <p id="evidence-error" className="error-text">{errors.evidence_description.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="evidence-image" className="label">Evidence Image (optional)</label>
            <input
              id="evidence-image"
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleImageChange}
              className="input-field file:mr-3 file:rounded-full file:border-0 file:bg-coral-50 file:px-3 file:py-1 file:text-xs file:font-medium file:text-coral hover:file:bg-coral-100"
            />
          </div>

          <div className="flex gap-3 justify-end pt-2">
            <button
              type="button"
              className="btn-ghost text-sm"
              onClick={() => setOpen(false)}
            >
              Cancel
            </button>
            <button type="submit" className="btn-primary text-sm" disabled={isSubmitting}>
              {isSubmitting ? "Submitting..." : "Submit Claim"}
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
}
