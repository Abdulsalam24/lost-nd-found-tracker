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
  created_at: string;
}

export default function AdminItemsPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterCategory, setFilterCategory] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

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

  const handleDelete = async (itemId: string) => {
    if (!confirm("Are you sure you want to delete this item?")) return;
    try {
      await api.delete(`/admin/items/${itemId}`);
      setItems((prev) => prev.filter((item) => item.id !== itemId));
    } catch {
      alert("Failed to delete item");
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
                      onClick={() => handleDelete(item.id)}
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
    </div>
  );
}
