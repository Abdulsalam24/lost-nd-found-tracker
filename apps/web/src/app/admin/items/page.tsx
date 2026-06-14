"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { StatusBadge } from "@/components/StatusBadge";
import { CategoryBadge } from "@/components/CategoryBadge";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { EmptyState } from "@/components/EmptyState";
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

export default function AdminItemsPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterCategory, setFilterCategory] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<Item | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchItems = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (filterCategory) params.set("category", filterCategory);
    if (filterStatus) params.set("status", filterStatus);
    params.set("limit", "50");

    api.get<{ data: Item[] }>(`/admin/items?${params.toString()}`)
      .then((res) => setItems(res.data ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [filterCategory, filterStatus]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const handleStatusChange = async (itemId: string, status: string) => {
    try {
      await api.patch(`/admin/items/${itemId}/status`, { status });
      setItems((prev) =>
        prev.map((item) => (item.id === itemId ? { ...item, status } : item))
      );
    } catch {
      alert("Failed to update status");
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

  return (
    <div>
      <h1 className="section-title">Manage Items</h1>

      <div className="mt-4 flex flex-wrap gap-3">
        <select
          className="input-field w-auto"
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
          className="input-field w-auto"
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
        <div className="mt-6 card overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="table-header">
                <th scope="col" className="px-4 py-3 text-left font-semibold text-ink-faint">Image</th>
                <th scope="col" className="px-4 py-3 text-left font-semibold text-ink-faint">Title</th>
                <th scope="col" className="px-4 py-3 text-left font-semibold text-ink-faint">Type</th>
                <th scope="col" className="px-4 py-3 text-left font-semibold text-ink-faint">Category</th>
                <th scope="col" className="px-4 py-3 text-left font-semibold text-ink-faint">Status</th>
                <th scope="col" className="px-4 py-3 text-left font-semibold text-ink-faint">Date</th>
                <th scope="col" className="px-4 py-3 text-right font-semibold text-ink-faint">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cream-200">
              {items.map((item) => (
                <tr key={item.id} className="table-row">
                  <td className="px-4 py-3">
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
                  <td className="px-4 py-3">
                    <Link href={`/items/${item.id}`} className="font-semibold text-coral hover:text-coral-dark">
                      {item.title ?? "_"}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-bold uppercase tracking-wider ${item.type === "LOST" ? "text-coral" : "text-emerald-600"}`}>
                      {item.type ?? "_"}
                    </span>
                  </td>
                  <td className="px-4 py-3"><CategoryBadge category={item.category} /></td>
                  <td className="px-4 py-3">
                    <select
                      className="input-field w-auto py-1 text-xs"
                      value={item.status}
                      onChange={(e) => handleStatusChange(item.id, e.target.value)}
                      aria-label={`Change status for ${item.title}`}
                    >
                      {ITEM_STATUSES.map((s) => (
                        <option key={s.value} value={s.value}>{s.label}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-3 text-xs text-ink-faint">
                    {item.date_of_event ? new Date(item.date_of_event).toLocaleDateString() : "_"}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      type="button"
                      className="btn-danger text-xs"
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
      ) : (
        <EmptyState title="No items" message="No items match your filters." />
      )}

      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="w-full max-w-sm rounded-2xl border border-border-card bg-bg-elevated p-6 shadow-xl">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-red-950/50 text-red-400">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </span>
              <div>
                <h3 className="text-base font-semibold text-text">Delete Item</h3>
                <p className="mt-1 text-sm text-text-secondary">
                  Are you sure you want to delete <strong className="text-text">{deleteTarget.title}</strong>? This action cannot be undone.
                </p>
              </div>
            </div>
            <div className="mt-6 flex gap-3 justify-end">
              <button
                type="button"
                className="btn-secondary text-sm"
                onClick={() => setDeleteTarget(null)}
                disabled={deleting}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn-danger text-sm"
                onClick={confirmDelete}
                disabled={deleting}
              >
                {deleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
