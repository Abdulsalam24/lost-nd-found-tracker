"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import { ITEM_CATEGORIES, ITEM_STATUSES, CAMPUS_LOCATIONS } from "@/lib/constants";

const TYPE_OPTIONS = [
  { value: "", label: "All" },
  { value: "LOST", label: "Lost" },
  { value: "FOUND", label: "Found" },
];

export function SearchFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const updateParam = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      params.set("page", "1");
      router.push(`/items?${params.toString()}`);
    },
    [router, searchParams]
  );

  const currentType = searchParams.get("type") ?? "";

  return (
    <div className="card p-4">
      <div className="mb-4 flex items-center gap-1 rounded-full bg-cream-200 p-1">
        {TYPE_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => updateParam("type", opt.value)}
            className={`flex-1 rounded-full px-4 py-2 text-sm font-semibold uppercase tracking-wider transition-all ${
              currentType === opt.value
                ? "bg-ink text-cream"
                : "text-ink-muted hover:text-ink"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <div>
          <label htmlFor="filter-category" className="label">
            Category
          </label>
          <select
            id="filter-category"
            className="input-field"
            value={searchParams.get("category") ?? ""}
            onChange={(e) => updateParam("category", e.target.value)}
          >
            <option value="">All Categories</option>
            {ITEM_CATEGORIES.map((cat) => (
              <option key={cat.value} value={cat.value}>
                {cat.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="filter-status" className="label">
            Status
          </label>
          <select
            id="filter-status"
            className="input-field"
            value={searchParams.get("status") ?? ""}
            onChange={(e) => updateParam("status", e.target.value)}
          >
            <option value="">All Statuses</option>
            {ITEM_STATUSES.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="filter-location" className="label">
            Location
          </label>
          <select
            id="filter-location"
            className="input-field"
            value={searchParams.get("location") ?? ""}
            onChange={(e) => updateParam("location", e.target.value)}
          >
            <option value="">All Locations</option>
            {CAMPUS_LOCATIONS.map((loc) => (
              <option key={loc.id} value={loc.id}>
                {loc.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="relative mt-3">
        <label htmlFor="filter-search" className="sr-only">
          Search
        </label>
        <svg
          className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-faint"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
        <input
          id="filter-search"
          type="search"
          className="input-field pl-10"
          placeholder="Search by title or description..."
          defaultValue={searchParams.get("q") ?? ""}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              updateParam("q", (e.target as HTMLInputElement).value);
            }
          }}
        />
      </div>
    </div>
  );
}
