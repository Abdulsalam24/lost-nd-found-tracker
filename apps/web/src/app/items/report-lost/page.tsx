"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { ImageUpload } from "@/components/ImageUpload";
import { ITEM_CATEGORIES, CAMPUS_LOCATIONS } from "@/lib/constants";
import Link from "next/link";

const schema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  category: z.string().min(1, "Select a category"),
  location_name: z.string().min(1, "Select a location"),
  date_of_event: z.string().min(1, "Select the date"),
  serial_number: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

const DRAFT_KEY = "report-lost-draft";

export default function ReportLostPage() {
  const router = useRouter();
  const pathname = usePathname();
  const { user } = useAuth();
  const [error, setError] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);

  useEffect(() => {
    if (!error) return;
    const t = setTimeout(() => setError(""), 5000);
    return () => clearTimeout(t);
  }, [error]);

  const savedDraft = typeof window !== "undefined"
    ? (() => { try { return JSON.parse(sessionStorage.getItem(DRAFT_KEY) || "{}"); } catch { return {}; } })()
    : {};

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: savedDraft,
  });

  const handleFileSelect = useCallback((file: File) => {
    setImageFile(file);
  }, []);

  const onSubmit = async (data: FormData) => {
    if (!user) {
      sessionStorage.setItem(DRAFT_KEY, JSON.stringify(getValues()));
      router.push(`/auth/login?redirect=${pathname}`);
      return;
    }

    setError("");
    if (!imageFile) {
      setError("Please upload an image of the item");
      return;
    }
    try {
      const formData = new FormData();
      formData.append("file", imageFile);
      const { url } = await api.upload<{ url: string }>("/items/upload", formData);

      const payload = { ...data, type: "LOST" as const, image_url: url };
      const item = await api.post<{ id: string }>("/items", payload);

      sessionStorage.removeItem(DRAFT_KEY);
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
                <label htmlFor="location_name" className="label">Last Known Location</label>
                <select
                  id="location_name"
                  className="input-field"
                  {...register("location_name")}
                  aria-invalid={errors.location_name ? "true" : undefined}
                  aria-describedby={errors.location_name ? "loc-error" : undefined}
                >
                  <option value="">Select location</option>
                  {CAMPUS_LOCATIONS.map((loc) => (
                    <option key={loc.id} value={loc.name}>{loc.name}</option>
                  ))}
                </select>
                {errors.location_name && <p id="loc-error" className="error-text">{errors.location_name.message}</p>}
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
              <label className="label">Image</label>
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

      {error && (
        <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 animate-slide-up">
          <div className="flex items-center gap-3 rounded-xl border border-red-800/50 bg-red-950/90 px-4 py-3 shadow-lg backdrop-blur-sm">
            <svg className="h-5 w-5 flex-shrink-0 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm font-medium text-red-200">{error}</p>
            <button type="button" onClick={() => setError("")} className="ml-2 text-red-400 hover:text-red-300">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
