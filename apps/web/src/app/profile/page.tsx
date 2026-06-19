"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { api } from "@/lib/api";
import { SkeletonProfileForm } from "@/components/Skeleton";

export default function ProfilePage() {
  const { user, loading, refreshUser } = useAuth();
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    name: "",
    faculty: "",
    phone: "",
    bank_name: "",
    account_number: "",
    account_name: "",
  });

  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth/login");
      return;
    }
    if (user) {
      setForm({
        name: user.name ?? "",
        faculty: user.faculty ?? "",
        phone: user.phone ?? "",
        bank_name: user.bank_name ?? "",
        account_number: user.account_number ?? "",
        account_name: user.account_name ?? "",
      });
    }
  }, [user, loading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess(false);

    try {
      await api.patch("/users/me", form);
      await refreshUser();
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  if (loading || !user) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-12">
        <div className="h-8 w-40 rounded bg-bg-elevated animate-pulse mb-4" />
        <SkeletonProfileForm />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="section-title">My Profile</h1>
      <p className="section-subtitle mt-2">Manage your personal information and bank details.</p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-8">
        {/* Personal Info */}
        <div className="card p-6">
          <h2 className="text-lg font-bold text-ink">Personal Information</h2>
          <div className="divider" />
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="name" className="label">Full Name</label>
              <input
                id="name"
                type="text"
                className="input-field"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div>
              <label htmlFor="email" className="label">Email</label>
              <input
                id="email"
                type="email"
                className="input-field opacity-60"
                value={user.email}
                disabled
              />
            </div>
            <div>
              <label htmlFor="faculty" className="label">Faculty</label>
              <input
                id="faculty"
                type="text"
                className="input-field"
                value={form.faculty}
                onChange={(e) => setForm({ ...form, faculty: e.target.value })}
              />
            </div>
            <div>
              <label htmlFor="phone" className="label">Phone Number</label>
              <input
                id="phone"
                type="tel"
                className="input-field"
                placeholder="08012345678"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
            </div>
          </div>
        </div>

        {/* Bank Details */}
        <div className="card p-6">
          <h2 className="text-lg font-bold text-ink">Bank Details</h2>
          <p className="mt-1 text-sm text-ink-muted">
            Used for receiving refunds or rewards. Your details are kept private.
          </p>
          <div className="divider" />
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="bank_name" className="label">Bank Name</label>
              <input
                id="bank_name"
                type="text"
                className="input-field"
                placeholder="e.g. GTBank, First Bank"
                value={form.bank_name}
                onChange={(e) => setForm({ ...form, bank_name: e.target.value })}
              />
            </div>
            <div>
              <label htmlFor="account_number" className="label">Account Number</label>
              <input
                id="account_number"
                type="text"
                className="input-field"
                placeholder="0123456789"
                maxLength={10}
                value={form.account_number}
                onChange={(e) => setForm({ ...form, account_number: e.target.value.replace(/\D/g, "") })}
              />
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="account_name" className="label">Account Name</label>
              <input
                id="account_name"
                type="text"
                className="input-field"
                placeholder="Name on your bank account"
                value={form.account_name}
                onChange={(e) => setForm({ ...form, account_name: e.target.value })}
              />
            </div>
          </div>
        </div>

        {/* Stats Card */}
        <div className="card p-6">
          <h2 className="text-lg font-bold text-ink">Activity</h2>
          <div className="divider" />
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            <div className="rounded-xl bg-cream-100 p-4 text-center">
              <p className="text-2xl font-bold text-ink">{user.points ?? 0}</p>
              <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-ink-faint">Points</p>
            </div>
            <div className="rounded-xl bg-cream-100 p-4 text-center">
              <p className="text-2xl font-bold text-ink">{user.badges?.length ?? 0}</p>
              <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-ink-faint">Badges</p>
            </div>
            <div className="rounded-xl bg-cream-100 p-4 text-center">
              <p className="text-2xl font-bold text-coral">{user.role === "admin" ? "Admin" : "Member"}</p>
              <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-ink-faint">Role</p>
            </div>
          </div>
          {user.badges && user.badges.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {user.badges.map((b) => (
                <span key={b.type} className="badge-accent">{b.name}</span>
              ))}
            </div>
          )}
        </div>

        {error && <p className="error-text text-sm">{error}</p>}
        {success && <p className="text-sm font-medium text-emerald-600">Profile updated successfully!</p>}

        <div className="flex justify-end">
          <button type="submit" className="btn-primary" disabled={saving}>
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
}
