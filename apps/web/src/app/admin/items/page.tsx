"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { StatusBadge } from "@/components/items/StatusBadge";
import { CategoryBadge } from "@/components/items/CategoryBadge";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { EmptyState } from "@/components/ui/EmptyState";
import { ITEM_CATEGORIES, ITEM_STATUSES } from "@/lib/constants";

interface Item {
  id: string;
  title: string;
  type: string;
  category: string;
  status: string;
  location_id: string;
  date_of_event: string;
  image_url?: string;
  created_at: string;
}

interface PaginatedResponse {
  data: Item[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

export default function AdminItemsPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<Item | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [statusTarget, setStatusTarget] = useState<{ item: Item; status: string } | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 300);
    return () => clearTimeout(t);
  }, [search]);

  const fetchItems = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (debouncedSearch) params.set("search", debouncedSearch);
    if (filterCategory) params.set("category", filterCategory);
    if (filterStatus) params.set("status", filterStatus);
    params.set("page", String(page));
    params.set("limit", "20");

    api.get<PaginatedResponse>(`/admin/items?${params.toString()}`)
      .then((res) => {
        setItems(res.data ?? []);
        setTotalPages(res.total_pages ?? 1);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [debouncedSearch, filterCategory, filterStatus, page]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const handleStatusSelect = (item: Item, newStatus: string) => {
    if (newStatus === item.status) return;
    setStatusTarget({ item, status: newStatus });
  };

  const confirmStatusChange = async () => {
    if (!statusTarget) return;
    setUpdatingStatus(true);
    try {
      await api.patch(`/admin/items/${statusTarget.item.id}/status`, { status: statusTarget.status });
      setItems((prev) =>
        prev.map((item) => (item.id === statusTarget.item.id ? { ...item, status: statusTarget.status } : item))
      );
      setStatusTarget(null);
    } catch {
      alert("Failed to update status");
    } finally {
      setUpdatingStatus(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.delete(`/admin/items/${deleteTarget.id}`);
      setItems((prev) => prev.filter((item) => item.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch {
      alert("Failed to delete item");
    } finally {
      setDeleting(false);
    }
  };

  const typeBadge = (type: string) => (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider border ${
      type === "LOST"
        ? "bg-red-500/10 text-red-600 border-red-500/20"
        : "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
    }`}>
      {type ?? "_"}
    </span>
  );

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3">
        <input
          type="text"
          className="input-field w-auto min-w-[200px] !py-2"
          placeholder="Search items..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className="input-field w-auto !py-2"
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          aria-label="Filter by category"
        >
          <option value="">All Categories</option>
          {ITEM_CATEGORIES.map((cat) => (
            <option key={cat.value} value={cat.value}>{cat.label}</option>
          ))}
        </select>
        <select
          className="input-field w-auto !py-2"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          aria-label="Filter by status"
        >
          <option value="">All Statuses</option>
          {ITEM_STATUSES.map((s) => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : items.length > 0 ? (
        <>
        {/* Desktop table */}
        <div className="mt-6 card overflow-x-auto hidden md:block">
          <table className="w-full text-xs">
            <thead>
              <tr className="table-header">
                <th scope="col" className="px-5 py-3.5 text-left font-semibold text-text-muted">Image</th>
                <th scope="col" className="px-5 py-3.5 text-left font-semibold text-text-muted">Title</th>
                <th scope="col" className="px-5 py-3.5 text-left font-semibold text-text-muted">Type</th>
                <th scope="col" className="px-5 py-3.5 text-left font-semibold text-text-muted">Category</th>
                <th scope="col" className="px-5 py-3.5 text-left font-semibold text-text-muted">Status</th>
                <th scope="col" className="px-5 py-3.5 text-left font-semibold text-text-muted">Date</th>
                <th scope="col" className="px-5 py-3.5 text-right font-semibold text-text-muted">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id} className="table-row">
                  <td className="px-5 py-3.5">
                    {item.image_url ? (
                      <img
                        src={item.image_url}
                        alt={item.title ?? "Item"}
                        className="h-10 w-10 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-bg-elevated">
                        <svg className="h-5 w-5 text-text-ghost" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    )}
                  </td>
                  <td className="px-5 py-3.5">
                    <Link href={`/items/${item.id}`} className="font-semibold text-accent hover:text-accent-light hover:underline">
                      {item.title ?? "_"}
                    </Link>
                  </td>
                  <td className="px-5 py-3.5">{typeBadge(item.type)}</td>
                  <td className="px-5 py-3.5"><CategoryBadge category={item.category} /></td>
                  <td className="px-5 py-3.5">
                    <select
                      className="rounded-lg border border-border bg-bg-card px-2.5 py-1.5 text-xs text-text transition-colors focus:border-accent focus:ring-1 focus:ring-accent"
                      value={item.status}
                      onChange={(e) => handleStatusSelect(item, e.target.value)}
                      aria-label={`Change status for ${item.title}`}
                    >
                      {ITEM_STATUSES.map((s) => (
                        <option key={s.value} value={s.value}>{s.label}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-5 py-3.5 text-xs text-text-muted">
                    {item.date_of_event ? new Date(item.date_of_event).toLocaleDateString() : "_"}
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <button
                      type="button"
                      className="rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-1.5 text-xs font-medium text-red-600 transition-colors hover:bg-red-500/20"
                      onClick={() => setDeleteTarget(item)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile cards */}
        <div className="mt-6 flex flex-col gap-3 md:hidden">
          {items.map((item) => (
            <div key={item.id} className="card p-4">
              <div className="flex items-start gap-3">
                {item.image_url ? (
                  <img src={item.image_url} alt={item.title ?? "Item"} className="h-12 w-12 rounded-lg object-cover shrink-0" />
                ) : (
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-bg-elevated">
                    <svg className="h-5 w-5 text-text-ghost" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <Link href={`/items/${item.id}`} className="text-sm font-semibold text-accent hover:underline truncate block">
                    {item.title ?? "_"}
                  </Link>
                  <div className="mt-1 flex items-center gap-2">
                    {typeBadge(item.type)}
                    <CategoryBadge category={item.category} />
                  </div>
                  <p className="mt-1 text-[11px] text-text-muted">
                    {item.date_of_event ? new Date(item.date_of_event).toLocaleDateString() : "_"}
                  </p>
                </div>
              </div>
              <div className="mt-3 flex items-center justify-between gap-2">
                <select
                  className="rounded-lg border border-border bg-bg-card px-2.5 py-1.5 text-xs text-text transition-colors focus:border-accent focus:ring-1 focus:ring-accent"
                  value={item.status}
                  onChange={(e) => handleStatusSelect(item, e.target.value)}
                  aria-label={`Change status for ${item.title}`}
                >
                  {ITEM_STATUSES.map((s) => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </select>
                <button
                  type="button"
                  className="rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-1.5 text-xs font-medium text-red-600 transition-colors hover:bg-red-500/20"
                  onClick={() => setDeleteTarget(item)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>

        {totalPages > 1 && (
          <div className="mt-6 flex items-center justify-center gap-3">
            <button
              type="button"
              className="btn-secondary text-xs !py-2"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Previous
            </button>
            <span className="text-xs text-text-muted">
              {page} / {totalPages}
            </span>
            <button
              type="button"
              className="btn-secondary text-xs !py-2"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            >
              Next
            </button>
          </div>
        )}
        </>
      ) : (
        <EmptyState title="No items" message="No items match your filters." />
      )}

      {/* Delete confirmation modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4" onClick={() => setDeleteTarget(null)}>
          <div className="w-full max-w-sm rounded-2xl border border-border bg-bg-card p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-500/10">
                <svg className="h-5 w-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </span>
              <div>
                <h3 className="text-base font-semibold text-text">Delete Item</h3>
                <p className="mt-1 text-xs text-text-secondary">
                  Are you sure you want to delete <strong className="text-text">{deleteTarget.title}</strong>? This action cannot be undone.
                </p>
              </div>
            </div>
            <div className="mt-6 flex gap-3 justify-end">
              <button
                type="button"
                className="btn-secondary text-xs"
                onClick={() => setDeleteTarget(null)}
                disabled={deleting}
              >
                Cancel
              </button>
              <button
                type="button"
                className="inline-flex items-center justify-center rounded-full bg-red-500 px-6 py-3 text-xs font-semibold text-white transition-all hover:bg-red-600 disabled:opacity-50"
                onClick={confirmDelete}
                disabled={deleting}
              >
                {deleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Status change confirmation modal */}
      {statusTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4" onClick={() => setStatusTarget(null)}>
          <div className="w-full max-w-sm rounded-2xl border border-border bg-bg-card p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-500/10">
                <svg className="h-5 w-5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </span>
              <div>
                <h3 className="text-base font-semibold text-text">Update Status</h3>
                <p className="mt-1 text-xs text-text-secondary">
                  Change <strong className="text-text">{statusTarget.item.title}</strong> status from <strong className="text-text">{statusTarget.item.status}</strong> to <strong className="text-text">{statusTarget.status}</strong>?
                </p>
              </div>
            </div>
            <div className="mt-6 flex gap-3 justify-end">
              <button
                type="button"
                className="btn-secondary text-xs"
                onClick={() => setStatusTarget(null)}
                disabled={updatingStatus}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn-primary text-xs"
                onClick={confirmStatusChange}
                disabled={updatingStatus}
              >
                {updatingStatus ? "Updating..." : "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
