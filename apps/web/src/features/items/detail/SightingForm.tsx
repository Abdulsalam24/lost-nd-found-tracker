"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";

const schema = z.object({
  description: z.string().min(5, "Description must be at least 5 characters"),
  location_id: z.string().optional(),
  spotted_at: z.string().min(1, "Select the date and time"),
});

type FormData = z.infer<typeof schema>;

interface LocationOption {
  id: string;
  name: string;
}

export function SightingForm({ itemId, reporterId }: { itemId: string; reporterId: string }) {
  const { user } = useAuth();

  if (user?.id === reporterId) return null;
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [locations, setLocations] = useState<LocationOption[]>([]);

  useEffect(() => {
    api.get<LocationOption[]>("/items/locations").then(setLocations).catch(() => {});
  }, []);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    setError("");
    setSuccess(false);
    try {
      await api.post(`/items/${itemId}/sightings`, {
        ...data,
        item_report_id: itemId,
      });
      setSuccess(true);
      reset();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit sighting");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="mt-4 space-y-4" noValidate>
      {success && (
        <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs text-emerald-400" role="alert">
          Sighting reported successfully!
        </div>
      )}
      {error && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-400" role="alert">
          {error}
        </div>
      )}

      <div>
        <label htmlFor="sighting-desc" className="label">What did you see?</label>
        <textarea
          id="sighting-desc"
          rows={3}
          className="input-field"
          placeholder="Describe where and when you saw this item..."
          {...register("description")}
          aria-invalid={errors.description ? "true" : undefined}
          aria-describedby={errors.description ? "sight-desc-error" : undefined}
        />
        {errors.description && <p id="sight-desc-error" className="error-text">{errors.description.message}</p>}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="sighting-location" className="label">Location (optional)</label>
          <select id="sighting-location" className="input-field" {...register("location_id")}>
            <option value="">Select location</option>
            {locations.map((loc) => (
              <option key={loc.id} value={loc.id}>{loc.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="sighting-date" className="label">When spotted</label>
          <input
            id="sighting-date"
            type="datetime-local"
            className="input-field"
            {...register("spotted_at")}
            aria-invalid={errors.spotted_at ? "true" : undefined}
            aria-describedby={errors.spotted_at ? "sight-date-error" : undefined}
          />
          {errors.spotted_at && <p id="sight-date-error" className="error-text">{errors.spotted_at.message}</p>}
        </div>
      </div>

      <button type="submit" className="btn-primary text-xs" disabled={isSubmitting}>
        {isSubmitting ? "Submitting..." : "Report Sighting"}
      </button>
    </form>
  );
}
