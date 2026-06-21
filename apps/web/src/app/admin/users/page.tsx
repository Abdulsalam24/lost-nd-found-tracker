"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { EmptyState } from "@/components/ui/EmptyState";

interface UserItem {
  id: string;
  name: string;
  email: string;
  faculty: string;
  role: string;
  phone: string | null;
  is_verified: boolean;
  created_at: string;
}

interface PaginatedResponse {
  data: UserItem[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

export default function AdminUsersPage() {
  const { user: me } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [selectedUser, setSelectedUser] = useState<UserItem | null>(null);

  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 300);
    return () => clearTimeout(t);
  }, [search]);

  const fetchUsers = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (debouncedSearch) params.set("search", debouncedSearch);
    params.set("page", String(page));
    params.set("limit", "20");

    api.get<PaginatedResponse>(`/admin/users?${params.toString()}`)
      .then((res) => {
        setUsers(res.data ?? []);
        setTotalPages(res.total_pages ?? 1);
        setTotal(res.total ?? 0);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [debouncedSearch, page]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleMessage = async (targetUser: UserItem) => {
    try {
      const res = await api.post<{ id: string }>("/chat/conversations", {
        recipient_id: targetUser.id,
      });
      router.push(`/admin/chat/${res.id}`);
    } catch {
      alert("Failed to start conversation");
    }
  };

  const roleBadge = (role: string) => (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
      role === "admin"
        ? "bg-purple-500/10 text-purple-600 border border-purple-500/20"
        : "bg-bg-elevated text-text-muted border border-border"
    }`}>
      {role ?? "_"}
    </span>
  );

  return (
    <div>
      <div>
        <input
          type="text"
          className="input-field max-w-sm !py-2"
          placeholder="Search by name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : users.length > 0 ? (
        <>
          {/* Desktop table */}
          <div className="mt-6 card overflow-x-auto hidden md:block">
            <table className="w-full text-xs">
              <thead>
                <tr className="table-header">
                  <th scope="col" className="px-5 py-3.5 text-left font-semibold text-text-muted">Name</th>
                  <th scope="col" className="px-5 py-3.5 text-left font-semibold text-text-muted">Email</th>
                  <th scope="col" className="px-5 py-3.5 text-left font-semibold text-text-muted">Faculty</th>
                  <th scope="col" className="px-5 py-3.5 text-left font-semibold text-text-muted">Phone</th>
                  <th scope="col" className="px-5 py-3.5 text-left font-semibold text-text-muted">Role</th>
                  <th scope="col" className="px-5 py-3.5 text-left font-semibold text-text-muted">Joined</th>
                  <th scope="col" className="px-5 py-3.5 text-right font-semibold text-text-muted">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="table-row">
                    <td className="px-5 py-3.5">
                      <button
                        type="button"
                        className="flex items-center gap-2.5 text-left hover:opacity-80 transition-opacity"
                        onClick={() => setSelectedUser(u)}
                      >
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent/15 text-xs font-bold text-accent">
                          {(u.name ?? "?").charAt(0).toUpperCase()}
                        </span>
                        <div>
                          <p className="font-semibold text-accent hover:underline">{u.name ?? "_"}</p>
                          {!u.is_verified && (
                            <span className="text-[10px] text-amber-500">Unverified</span>
                          )}
                        </div>
                      </button>
                    </td>
                    <td className="px-5 py-3.5 text-text-muted">{u.email ?? "_"}</td>
                    <td className="px-5 py-3.5 text-text-muted">{u.faculty ?? "_"}</td>
                    <td className="px-5 py-3.5 text-text-muted">{u.phone ?? "_"}</td>
                    <td className="px-5 py-3.5">{roleBadge(u.role)}</td>
                    <td className="px-5 py-3.5 text-text-muted">
                      {u.created_at ? new Date(u.created_at).toLocaleDateString() : "_"}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          className="rounded-lg border border-border bg-bg-elevated px-3 py-1.5 text-xs font-medium text-text-muted transition-colors hover:bg-bg-hover hover:text-text"
                          onClick={() => setSelectedUser(u)}
                        >
                          View
                        </button>
                        {u.id !== me?.id && (
                          <button
                            type="button"
                            className="rounded-lg border border-accent/30 bg-accent/10 px-3 py-1.5 text-xs font-medium text-accent transition-colors hover:bg-accent/20"
                            onClick={() => handleMessage(u)}
                          >
                            Message
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="mt-6 flex flex-col gap-3 md:hidden">
            {users.map((u) => (
              <div key={u.id} className="card p-4">
                <button
                  type="button"
                  className="flex w-full items-start gap-3 text-left"
                  onClick={() => setSelectedUser(u)}
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent/15 text-sm font-bold text-accent">
                    {(u.name ?? "?").charAt(0).toUpperCase()}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-text truncate">{u.name ?? "_"}</p>
                      {roleBadge(u.role)}
                    </div>
                    <p className="text-[11px] text-text-muted truncate">{u.email ?? "_"}</p>
                    <div className="mt-1 flex items-center gap-3 text-[11px] text-text-muted">
                      <span>{u.faculty ?? "_"}</span>
                      {u.phone && <span>{u.phone}</span>}
                    </div>
                  </div>
                </button>
                <div className="mt-3 flex gap-2">
                  <button
                    type="button"
                    className="flex-1 rounded-lg border border-border bg-bg-elevated py-2 text-xs font-medium text-text-muted transition-colors hover:bg-bg-hover hover:text-text"
                    onClick={() => setSelectedUser(u)}
                  >
                    View Profile
                  </button>
                  {u.id !== me?.id && (
                    <button
                      type="button"
                      className="flex-1 rounded-lg border border-accent/30 bg-accent/10 py-2 text-xs font-medium text-accent transition-colors hover:bg-accent/20"
                      onClick={() => handleMessage(u)}
                    >
                      Message
                    </button>
                  )}
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
        <EmptyState title="No users" message="No users match your search." />
      )}

      {/* User profile modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4" onClick={() => setSelectedUser(null)}>
          <div className="w-full max-w-md rounded-2xl border border-border bg-bg-card p-0 shadow-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div className="relative bg-accent/10 px-6 pt-6 pb-10">
              <button
                type="button"
                className="absolute right-3 top-3 rounded-lg p-1.5 text-text-ghost transition-colors hover:bg-black/10 hover:text-text"
                onClick={() => setSelectedUser(null)}
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Avatar overlapping header */}
            <div className="relative px-6">
              <div className="-mt-8 flex items-end gap-4">
                <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-accent text-xl font-bold text-white border-4 border-bg-card shadow-lg">
                  {(selectedUser.name ?? "?").charAt(0).toUpperCase()}
                </span>
                <div className="pb-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold text-text truncate">{selectedUser.name ?? "_"}</h3>
                    {roleBadge(selectedUser.role)}
                  </div>
                  <p className="text-xs text-text-muted truncate">{selectedUser.email ?? "_"}</p>
                </div>
              </div>
            </div>

            {/* Details */}
            <div className="px-6 pt-5 pb-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-text-ghost">Faculty</p>
                  <p className="mt-0.5 text-sm text-text">{selectedUser.faculty ?? "_"}</p>
                </div>
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-text-ghost">Phone</p>
                  <p className="mt-0.5 text-sm text-text">{selectedUser.phone ?? "_"}</p>
                </div>
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-text-ghost">Verified</p>
                  <p className="mt-0.5 text-sm">
                    {selectedUser.is_verified ? (
                      <span className="text-emerald-500 font-medium">Yes</span>
                    ) : (
                      <span className="text-amber-500 font-medium">No</span>
                    )}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-text-ghost">Joined</p>
                  <p className="mt-0.5 text-sm text-text">
                    {selectedUser.created_at ? new Date(selectedUser.created_at).toLocaleDateString("en", { year: "numeric", month: "long", day: "numeric" }) : "_"}
                  </p>
                </div>
              </div>

              {/* Actions */}
              {selectedUser.id !== me?.id && (
                <div className="flex gap-3 pt-2 border-t border-border">
                  <button
                    type="button"
                    className="flex-1 btn-primary text-xs"
                    onClick={() => {
                      setSelectedUser(null);
                      handleMessage(selectedUser);
                    }}
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    Send Message
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
