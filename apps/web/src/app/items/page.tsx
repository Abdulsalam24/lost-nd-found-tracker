"use client";

import { Suspense } from "react";
import Link from "next/link";
import { SearchFilters } from "@/components/items/SearchFilters";
import { SkeletonItemGrid } from "@/components/ui/Skeleton";
import { ItemList } from "@/features/items/ItemList";

export default function ItemsPage() {
  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-text sm:text-4xl">Browse Items</h1>
            <p className="mt-2 text-sm text-text-secondary">Find lost items or report what you found on campus.</p>
          </div>
          <Link href="/items/report-lost" className="btn-primary shrink-0 gap-1.5 text-xs">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Report Item
          </Link>
        </div>

        {/* Filters */}
        <div className="mt-8">
          <Suspense fallback={<SkeletonItemGrid />}>
            <SearchFilters />
          </Suspense>
        </div>

        {/* Items grid */}
        <Suspense fallback={<div className="mt-6"><SkeletonItemGrid /></div>}>
          <ItemList />
        </Suspense>
      </div>
    </div>
  );
}
