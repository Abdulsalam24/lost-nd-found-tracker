"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";
import { ItemCard } from "@/components/items/ItemCard";
import { SkeletonItemGrid } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

interface ItemResponse {
  id: string;
  title: string;
  type: string;
  category: string;
  status: string;
  location_id: string;
  date_of_event: string;
  image_url?: string;
  reporter?: { id: string; name: string } | null;
}

interface PaginatedItems {
  data: ItemResponse[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

const LIMIT = 12;

export function ItemList() {
  const searchParams = useSearchParams();
  const [items, setItems] = useState<ItemResponse[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const paramsKey = searchParams.toString();

  const buildUrl = useCallback(
    (p: number) => {
      const params = new URLSearchParams();
      searchParams.forEach((val, key) => {
        if (val) params.set(key === "q" ? "search" : key, val);
      });
      params.set("page", String(p));
      params.set("limit", String(LIMIT));
      return `/items?${params.toString()}`;
    },
    [searchParams]
  );

  // Reset when filters change
  useEffect(() => {
    setItems([]);
    setPage(1);
    setTotalPages(1);
    setLoading(true);

    api.get<PaginatedItems>(buildUrl(1))
      .then((res) => {
        setItems(res.data ?? []);
        setTotalPages(res.total_pages ?? 1);
        setPage(1);
      })
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, [paramsKey, buildUrl]);

  // Load more
  const loadMore = useCallback(() => {
    if (loadingMore || page >= totalPages) return;
    const nextPage = page + 1;
    setLoadingMore(true);

    api.get<PaginatedItems>(buildUrl(nextPage))
      .then((res) => {
        setItems((prev) => [...prev, ...(res.data ?? [])]);
        setPage(nextPage);
        setTotalPages(res.total_pages ?? 1);
      })
      .catch(() => {})
      .finally(() => setLoadingMore(false));
  }, [page, totalPages, loadingMore, buildUrl]);

  // Intersection observer for infinite scroll
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) loadMore();
      },
      { rootMargin: "200px" }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [loadMore]);

  if (loading) {
    return <div className="mt-8"><SkeletonItemGrid count={LIMIT} /></div>;
  }

  if (items.length === 0) {
    return (
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
    );
  }

  return (
    <>
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <ItemCard key={item.id} {...item} />
        ))}
      </div>

      {/* Sentinel for infinite scroll */}
      {page < totalPages && (
        <div ref={sentinelRef} className="mt-6 flex justify-center py-4">
          {loadingMore && <LoadingSpinner size="sm" />}
        </div>
      )}

      {page >= totalPages && items.length > LIMIT && (
        <p className="mt-6 text-center text-[11px] text-text-ghost">You&apos;ve seen all {items.length} items</p>
      )}
    </>
  );
}
