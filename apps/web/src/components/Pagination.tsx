"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  basePath: string;
}

export function Pagination({ currentPage, totalPages, basePath }: PaginationProps) {
  const searchParams = useSearchParams();

  if (totalPages <= 1) return null;

  const buildHref = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(page));
    return `${basePath}?${params.toString()}`;
  };

  const pages: (number | "...")[] = [];
  if (totalPages <= 7) {
    Array.from({ length: totalPages }).forEach((_, i) => pages.push(i + 1));
  } else {
    pages.push(1);
    if (currentPage > 3) pages.push("...");
    const start = Math.max(2, currentPage - 1);
    const end = Math.min(totalPages - 1, currentPage + 1);
    Array.from({ length: end - start + 1 }).forEach((_, i) => pages.push(start + i));
    if (currentPage < totalPages - 2) pages.push("...");
    pages.push(totalPages);
  }

  return (
    <nav aria-label="Pagination" className="mt-8 flex items-center justify-center gap-1">
      <Link
        href={buildHref(Math.max(1, currentPage - 1))}
        className={`rounded-xl px-4 py-2 text-sm font-medium transition-colors ${
          currentPage <= 1
            ? "pointer-events-none text-cream-400"
            : "bg-white border border-cream-300 text-ink hover:bg-cream-100"
        }`}
        aria-disabled={currentPage <= 1}
        aria-label="Previous page"
      >
        Previous
      </Link>

      {pages.map((page, idx) =>
        page === "..." ? (
          <span key={`ellipsis-${idx}`} className="px-2 text-ink-ghost">
            ...
          </span>
        ) : (
          <Link
            key={page}
            href={buildHref(page)}
            className={`rounded-xl px-3 py-2 text-sm font-medium transition-colors ${
              page === currentPage
                ? "bg-ink text-cream"
                : "bg-white border border-cream-300 text-ink hover:bg-cream-100"
            }`}
            aria-current={page === currentPage ? "page" : undefined}
          >
            {page}
          </Link>
        )
      )}

      <Link
        href={buildHref(Math.min(totalPages, currentPage + 1))}
        className={`rounded-xl px-4 py-2 text-sm font-medium transition-colors ${
          currentPage >= totalPages
            ? "pointer-events-none text-cream-400"
            : "bg-white border border-cream-300 text-ink hover:bg-cream-100"
        }`}
        aria-disabled={currentPage >= totalPages}
        aria-label="Next page"
      >
        Next
      </Link>
    </nav>
  );
}
