"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { api } from "@/lib/api";
import { ImageUpload } from "@/components/ImageUpload";
import { ITEM_CATEGORIES, CAMPUS_LOCATIONS } from "@/lib/constants";
import Link from "next/link";

const schema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  category: z.string().min(1, "Select a category"),
  location_id: z.string().min(1, "Select a location"),
  date_of_event: z.string().min(1, "Select the date"),
  serial_number: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

export default function ReportLostPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const handleFileSelect = useCallback((file: File) => {
    setImageFile(file);
  }, []);

  const onSubmit = async (data: FormData) => {
    setError("");
    try {
      const payload = { ...data, type: "LOST" as const };
      const item = await api.post<{ id: string }>("/items", payload);

      if (imageFile && item.id) {
        const formData = new FormData();
        formData.append("file", imageFile);
        await api.upload(`/items/${item.id}/image`, formData);
      }

      router.push(`/items/${item.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit report");
    }
  };

  return (
    <div className="min-h-screen bg-cream">
      <div className="mx-auto max-w-2xl px-4 py-8">
        <Link
          href="/items"
          className="inline-flex items-center gap-1 text-sm text-ink-muted hover:text-coral transition-colors"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to items
        </Link>

        <div className="mt-6 card p-6 sm:p-8">
          <h1 className="section-title">Report Lost Item</h1>
          <p className="section-subtitle mt-1">
            Fill in the details about the item you lost on campus.
          </p>

          {error && (
            <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600" role="alert">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-5" noValidate>
            <div>
              <label htmlFor="title" className="label">Item Title</label>
              <input
                id="title"
                type="text"
                className="input-field"
                placeholder="e.g., Blue Samsung Phone"
                {...register("title")}
                aria-invalid={errors.title ? "true" : undefined}
                aria-describedby={errors.title ? "title-error" : undefined}
              />
              {errors.title && <p id="title-error" className="error-text">{errors.title.message}</p>}
            </div>

            <div>
              <label htmlFor="description" className="label">Description</label>
              <textarea
                id="description"
                rows={4}
                className="input-field"
                placeholder="Describe the item in detail..."
                {...register("description")}
                aria-invalid={errors.description ? "true" : undefined}
                aria-describedby={errors.description ? "desc-error" : undefined}
              />
              {errors.description && <p id="desc-error" className="error-text">{errors.description.message}</p>}
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="category" className="label">Category</label>
                <select
                  id="category"
                  className="input-field"
                  {...register("category")}
                  aria-invalid={errors.category ? "true" : undefined}
                  aria-describedby={errors.category ? "cat-error" : undefined}
                >
                  <option value="">Select category</option>
                  {ITEM_CATEGORIES.map((cat) => (
                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                  ))}
                </select>
                {errors.category && <p id="cat-error" className="error-text">{errors.category.message}</p>}
              </div>

              <div>
                <label htmlFor="location_id" className="label">Last Known Location</label>
                <select
                  id="location_id"
                  className="input-field"
                  {...register("location_id")}
                  aria-invalid={errors.location_id ? "true" : undefined}
                  aria-describedby={errors.location_id ? "loc-error" : undefined}
                >
                  <option value="">Select location</option>
                  {CAMPUS_LOCATIONS.map((loc) => (
                    <option key={loc.id} value={loc.id}>{loc.name}</option>
                  ))}
                </select>
                {errors.location_id && <p id="loc-error" className="error-text">{errors.location_id.message}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="date_of_event" className="label">Date Lost</label>
                <input
                  id="date_of_event"
                  type="date"
                  className="input-field"
                  {...register("date_of_event")}
                  aria-invalid={errors.date_of_event ? "true" : undefined}
                  aria-describedby={errors.date_of_event ? "date-error" : undefined}
                />
                {errors.date_of_event && <p id="date-error" className="error-text">{errors.date_of_event.message}</p>}
              </div>

              <div>
                <label htmlFor="serial_number" className="label">Serial Number (optional)</label>
                <input
                  id="serial_number"
                  type="text"
                  className="input-field"
                  placeholder="If applicable"
                  {...register("serial_number")}
                />
              </div>
            </div>

            <div>
              <label className="label">Image (optional)</label>
              <ImageUpload onFileSelect={handleFileSelect} />
            </div>

            <button
              type="submit"
              className="btn-primary w-full"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Submitting..." : "Submit Report"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
