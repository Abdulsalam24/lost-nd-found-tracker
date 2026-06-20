"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { uploadImage } from "@/lib/upload";
import { ImageUpload } from "@/components/items/ImageUpload";
import { ITEM_CATEGORIES, CAMPUS_LOCATIONS } from "@/lib/constants";
import Link from "next/link";
import { Suspense } from "react";

const schema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  category: z.string().min(1, "Select a category"),
  location_name: z.string().min(1, "Select a location"),
  date_of_event: z.string().min(1, "Select the date"),
  serial_number: z.string().optional(),
});

type FormData = z.infer<typeof schema>;
type ReportType = "LOST" | "FOUND";

const TAB_CONFIG = {
  LOST: {
    title: "Report Lost Item",
    subtitle: "Fill in the details about the item you lost on campus.",
    placeholder: { title: "e.g., Blue Samsung Phone", description: "Describe the item in detail..." },
    locationLabel: "Last Known Location",
    dateLabel: "Date Lost",
    serialPlaceholder: "If applicable",
    draftKey: "report-lost-draft",
  },
  FOUND: {
    title: "Report Found Item",
    subtitle: "Help someone get their item back by reporting what you found.",
    placeholder: { title: "e.g., Black Wallet with ID", description: "Describe the item you found..." },
    locationLabel: "Where Found",
    dateLabel: "Date Found",
    serialPlaceholder: "If visible",
    draftKey: "report-found-draft",
  },
};

export default function ReportPage() {
  return (
    <Suspense fallback={<div className="min-h-screen" />}>
      <ReportForm />
    </Suspense>
  );
}

function ReportForm() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const [error, setError] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);

  const initialType = (searchParams.get("type")?.toUpperCase() === "FOUND" ? "FOUND" : "LOST") as ReportType;
  const [type, setType] = useState<ReportType>(initialType);
  const config = TAB_CONFIG[type];

  const savedDraft = typeof window !== "undefined"
    ? (() => { try { return JSON.parse(sessionStorage.getItem(config.draftKey) || "{}"); } catch { return {}; } })()
    : {};

  const {
    register,
    handleSubmit,
    getValues,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: savedDraft,
  });

  useEffect(() => {
    if (!error) return;
    const t = setTimeout(() => setError(""), 5000);
    return () => clearTimeout(t);
  }, [error]);

  const switchType = (newType: ReportType) => {
    if (newType === type) return;
    // Save current draft
    sessionStorage.setItem(config.draftKey, JSON.stringify(getValues()));
    setType(newType);
    setImageFile(null);
    // Load draft for new type
    const draft = (() => { try { return JSON.parse(sessionStorage.getItem(TAB_CONFIG[newType].draftKey) || "{}"); } catch { return {}; } })();
    reset(draft);
  };

  const handleFileSelect = useCallback((file: File) => {
    setImageFile(file);
  }, []);

  const onSubmit = async (data: FormData) => {
    if (!user) {
      sessionStorage.setItem(config.draftKey, JSON.stringify(getValues()));
      router.push(`/auth/login?redirect=${pathname}?type=${type}`);
      return;
    }

    setError("");
    if (!imageFile) {
      setError("Please upload an image of the item");
      return;
    }
    try {
      const url = await uploadImage(imageFile);
      const payload = { ...data, type, image_url: url };
      const item = await api.post<{ id: string }>("/items", payload);

      sessionStorage.removeItem(config.draftKey);
      router.push(`/items/${item.id}`);
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? err?.message ?? "Failed to submit report";
      setError(msg);
    }
  };

  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-2xl px-4 py-8">
        <Link
          href="/items"
          className="inline-flex items-center gap-1 text-xs text-text-muted hover:text-accent transition-colors"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to items
        </Link>

        <div className="mt-6 card p-6 sm:p-8">
          {/* Tabs */}
          <div className="flex rounded-xl bg-bg-elevated p-1">
            {(["LOST", "FOUND"] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => switchType(t)}
                className={`flex-1 rounded-lg py-2.5 text-xs font-semibold transition-all ${
                  type === t
                    ? t === "LOST"
                      ? "bg-red-500/15 text-red-400 shadow-sm"
                      : "bg-emerald-500/15 text-emerald-400 shadow-sm"
                    : "text-text-muted hover:text-text"
                }`}
              >
                {t === "LOST" ? "I Lost Something" : "I Found Something"}
              </button>
            ))}
          </div>

          <h1 className="mt-6 section-title">{config.title}</h1>
          <p className="section-subtitle mt-1">{config.subtitle}</p>

          <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-5" noValidate>
            <div>
              <label htmlFor="title" className="label">Item Title</label>
              <input
                id="title"
                type="text"
                className="input-field"
                placeholder={config.placeholder.title}
                {...register("title")}
                aria-invalid={errors.title ? "true" : undefined}
              />
              {errors.title && <p className="error-text">{errors.title.message}</p>}
            </div>

            <div>
              <label htmlFor="description" className="label">Description</label>
              <textarea
                id="description"
                rows={4}
                className="input-field"
                placeholder={config.placeholder.description}
                {...register("description")}
                aria-invalid={errors.description ? "true" : undefined}
              />
              {errors.description && <p className="error-text">{errors.description.message}</p>}
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="category" className="label">Category</label>
                <select id="category" className="input-field" {...register("category")}>
                  <option value="">Select category</option>
                  {ITEM_CATEGORIES.map((cat) => (
                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                  ))}
                </select>
                {errors.category && <p className="error-text">{errors.category.message}</p>}
              </div>

              <div>
                <label htmlFor="location_name" className="label">{config.locationLabel}</label>
                <select id="location_name" className="input-field" {...register("location_name")}>
                  <option value="">Select location</option>
                  {CAMPUS_LOCATIONS.map((loc) => (
                    <option key={loc.id} value={loc.name}>{loc.name}</option>
                  ))}
                </select>
                {errors.location_name && <p className="error-text">{errors.location_name.message}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="date_of_event" className="label">{config.dateLabel}</label>
                <input id="date_of_event" type="date" className="input-field" {...register("date_of_event")} />
                {errors.date_of_event && <p className="error-text">{errors.date_of_event.message}</p>}
              </div>

              <div>
                <label htmlFor="serial_number" className="label">Serial Number (optional)</label>
                <input
                  id="serial_number"
                  type="text"
                  className="input-field"
                  placeholder={config.serialPlaceholder}
                  {...register("serial_number")}
                />
              </div>
            </div>

            <div>
              <label className="label">Image</label>
              <ImageUpload onFileSelect={handleFileSelect} />
            </div>

            <button type="submit" className="btn-primary w-full" disabled={isSubmitting}>
              {isSubmitting ? "Submitting..." : "Submit Report"}
            </button>
          </form>
        </div>
      </div>

      {error && (
        <div className="fixed top-20 right-4 z-50 animate-fade-in">
          <div className="flex items-center gap-3 rounded-xl border border-red-800/50 bg-red-950/90 px-4 py-3 shadow-lg backdrop-blur-sm max-w-sm">
            <svg className="h-5 w-5 flex-shrink-0 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-xs font-medium text-red-200">{error}</p>
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
