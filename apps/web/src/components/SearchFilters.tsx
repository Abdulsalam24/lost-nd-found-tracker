"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState, useRef } from "react";
import { ITEM_CATEGORIES, ITEM_STATUSES } from "@/lib/constants";
import { api } from "@/lib/api";

const TYPE_OPTIONS = [
  { value: "", label: "All", icon: "M4 6h16M4 10h16M4 14h16M4 18h16" },
  { value: "LOST", label: "Lost", icon: "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" },
  { value: "FOUND", label: "Found", icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" },
];

interface LocationOption {
  id: string;
  name: string;
}

export function SearchFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [locations, setLocations] = useState<LocationOption[]>([]);
  const [searchValue, setSearchValue] = useState(searchParams.get("q") ?? "");
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    api.get<LocationOption[]>("/items/locations").then(setLocations).catch(() => {});
  }, []);

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

  const handleSearch = useCallback(
    (value: string) => {
      setSearchValue(value);
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => updateParam("q", value), 400);
    },
    [updateParam]
  );

  const clearFilters = useCallback(() => {
    setSearchValue("");
    router.push("/items");
  }, [router]);

  const currentType = searchParams.get("type") ?? "";
  const currentCategory = searchParams.get("category") ?? "";
  const currentStatus = searchParams.get("status") ?? "";
  const currentLocation = searchParams.get("location") ?? "";
  const hasFilters = currentType || currentCategory || currentStatus || currentLocation || searchValue;

  return (
    <div className="space-y-3">
      {/* Search bar */}
      <div className="relative">
        <svg
          className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-text-ghost"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="search"
          className="w-full rounded-xl border border-white/[0.08] bg-white/[0.04] py-3 pl-11 pr-4 text-sm text-text placeholder:text-text-ghost backdrop-blur-2xl backdrop-saturate-150 outline-none transition-all focus:border-accent/40 focus:ring-1 focus:ring-accent/20"
          placeholder="Search items..."
          value={searchValue}
          onChange={(e) => handleSearch(e.target.value)}
        />
        {searchValue && (
          <button
            type="button"
            onClick={() => handleSearch("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-text-ghost transition-colors hover:text-text"
            aria-label="Clear search"
          >
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Type tabs + filters row */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Type toggle */}
        <div className="flex items-center gap-1 rounded-lg border border-white/[0.06] bg-white/[0.03] p-1 backdrop-blur-xl">
          {TYPE_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => updateParam("type", opt.value)}
              className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider transition-all ${
                currentType === opt.value
                  ? "bg-accent text-bg shadow-sm"
                  : "text-text-muted hover:text-text"
              }`}
            >
              <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={opt.icon} />
              </svg>
              {opt.label}
            </button>
          ))}
        </div>

        {/* Dropdown filters */}
        <div className="flex items-center gap-2">
          <select
            className="rounded-lg border border-white/[0.06] bg-white/[0.03] px-3 py-1.5 text-[11px] text-text backdrop-blur-xl outline-none transition-all focus:border-accent/40 [&>option]:bg-bg-elevated [&>option]:text-text"
            value={currentCategory}
            onChange={(e) => updateParam("category", e.target.value)}
            aria-label="Category"
          >
            <option value="">Category</option>
            {ITEM_CATEGORIES.map((cat) => (
              <option key={cat.value} value={cat.value}>{cat.label}</option>
            ))}
          </select>

          <select
            className="rounded-lg border border-white/[0.06] bg-white/[0.03] px-3 py-1.5 text-[11px] text-text backdrop-blur-xl outline-none transition-all focus:border-accent/40 [&>option]:bg-bg-elevated [&>option]:text-text"
            value={currentStatus}
            onChange={(e) => updateParam("status", e.target.value)}
            aria-label="Status"
          >
            <option value="">Status</option>
            {ITEM_STATUSES.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>

          <select
            className="hidden rounded-lg border border-white/[0.06] bg-white/[0.03] px-3 py-1.5 text-[11px] text-text backdrop-blur-xl outline-none transition-all focus:border-accent/40 sm:block [&>option]:bg-bg-elevated [&>option]:text-text"
            value={currentLocation}
            onChange={(e) => updateParam("location", e.target.value)}
            aria-label="Location"
          >
            <option value="">Location</option>
            {locations.map((loc) => (
              <option key={loc.id} value={loc.id}>{loc.name}</option>
            ))}
          </select>

          {hasFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="flex items-center gap-1 rounded-lg border border-red-500/20 bg-red-500/5 px-2.5 py-1.5 text-[11px] font-medium text-red-400 transition-colors hover:bg-red-500/10"
            >
              <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Clear
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
