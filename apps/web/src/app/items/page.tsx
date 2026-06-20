"use client";

import { Suspense } from "react";
import Link from "next/link";
import { SearchFilters } from "@/components/SearchFilters";
import { SkeletonItemGrid } from "@/components/Skeleton";
import { ItemList } from "./ItemList";

export default function ItemsPage() {
  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="section-title">Browse Items</h1>
            <p className="section-subtitle">Find lost items or report what you found on campus</p>
          </div>
          <div className="flex gap-3">
            <Link href="/items/report-lost" className="btn-primary text-xs">
              Report Lost
            </Link>
            <Link href="/items/report-found" className="btn-secondary text-xs">
              Report Found
            </Link>
          </div>
        </div>

        <div className="mt-8">
          <Suspense fallback={<SkeletonItemGrid />}>
            <SearchFilters />
          </Suspense>
        </div>

        <Suspense fallback={<div className="mt-8"><SkeletonItemGrid /></div>}>
          <ItemList />
        </Suspense>
      </div>
    </div>
  );
}
