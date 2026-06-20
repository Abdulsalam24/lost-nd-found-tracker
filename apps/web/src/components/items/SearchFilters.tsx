"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useState, useRef } from "react";
import { ITEM_CATEGORIES } from "@/lib/constants";

const TYPE_OPTIONS = [
  { value: "", label: "All" },
  { value: "LOST", label: "Lost" },
  { value: "FOUND", label: "Found" },
];

export function SearchFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchValue, setSearchValue] = useState(searchParams.get("q") ?? "");
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

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

  const currentType = searchParams.get("type") ?? "";
  const currentCategory = searchParams.get("category") ?? "";

  return (
    <div className="space-y-4">
      {/* Search bar */}
      <div className="relative">
        <svg
          className="absolute left-4 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-text-ghost"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="search"
          className="w-full rounded-2xl border border-border bg-bg-card py-3.5 pl-12 pr-4 text-sm text-text placeholder:text-text-ghost outline-none transition-all focus:border-accent/40 focus:ring-1 focus:ring-accent/20"
          placeholder="Search items..."
          value={searchValue}
          onChange={(e) => handleSearch(e.target.value)}
        />
        {searchValue && (
          <button
            type="button"
            onClick={() => handleSearch("")}
            className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full p-1 text-text-ghost transition-colors hover:text-text"
            aria-label="Clear search"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Type tabs */}
      <div className="flex gap-1.5">
        {TYPE_OPTIONS.map((t) => {
          const active = currentType === t.value;
          return (
            <button
              key={t.value}
              type="button"
              onClick={() => updateParam("type", t.value)}
              className={`rounded-full px-4 py-2 text-xs font-semibold transition-all ${
                active
                  ? "bg-accent text-bg"
                  : "bg-bg-card border border-border text-text-secondary hover:border-border-light hover:text-text"
              }`}
            >
              {t.label}
            </button>
          );
        })}
      </div>

      {/* Category pills */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
        {ITEM_CATEGORIES.map((cat) => {
          const active = currentCategory === cat.value;
          return (
            <button
              key={cat.value}
              type="button"
              onClick={() => updateParam("category", active ? "" : cat.value)}
              className={`flex shrink-0 items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-[11px] font-medium transition-all ${
                active
                  ? "border-accent/50 bg-accent/10 text-accent"
                  : "border-border bg-bg-card text-text-muted hover:border-border-light hover:text-text"
              }`}
            >
              {cat.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
