export const dynamic = "force-dynamic";

import { Suspense } from "react";
import { serverFetch } from "@/lib/api";
import { ItemCard } from "@/components/ItemCard";
import { SearchFilters } from "@/components/SearchFilters";
import { Pagination } from "@/components/Pagination";
import { EmptyState } from "@/components/EmptyState";
import { SkeletonItemGrid } from "@/components/Skeleton";
import Link from "next/link";

interface ItemResponse {
  id: string;
  title: string;
  type: string;
  category: string;
  status: string;
  location_id: string;
  date_of_event: string;
  image_url?: string;
}

interface PaginatedItems {
  data: ItemResponse[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

async function getItems(searchParams: Record<string, string | undefined>): Promise<PaginatedItems> {
  const params = new URLSearchParams();
  Object.entries(searchParams).forEach(([key, val]) => {
    if (val) params.set(key === "q" ? "search" : key, val);
  });
  if (!params.has("page")) params.set("page", "1");
  if (!params.has("limit")) params.set("limit", "12");

  try {
    return await serverFetch<PaginatedItems>(`/items?${params.toString()}`);
  } catch {
    return { data: [], total: 0, page: 1, limit: 12, total_pages: 0 };
  }
}

export default async function ItemsPage({
  searchParams,
}: {
  searchParams: Record<string, string | undefined>;
}) {
  const result = await getItems(searchParams);

  return (
    <div className="min-h-screen bg-cream">
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

        {result.data.length > 0 ? (
          <>
            <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {result.data.map((item) => (
                <ItemCard key={item.id} {...item} />
              ))}
            </div>
            <div className="mt-8">
              <Suspense fallback={null}>
                <Pagination
                  currentPage={result.page}
                  totalPages={result.total_pages}
                  basePath="/items"
                />
              </Suspense>
            </div>
          </>
        ) : (
          <div className="mt-12">
            <EmptyState
              title="No items found"
              message="Try adjusting your filters or report a new item."
              action={
                <Link href="/items/report-lost" className="btn-primary text-xs">
                  Report an Item
                </Link>
              }
            />
          </div>
        )}
      </div>
    </div>
  );
}
