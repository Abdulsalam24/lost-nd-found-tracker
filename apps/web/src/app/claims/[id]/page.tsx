"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { StatusBadge } from "@/components/StatusBadge";
import { Timeline } from "@/components/Timeline";

interface ClaimDetail {
  id: string;
  item_report_id: string;
  claimant_id: string;
  evidence_description: string;
  evidence_image_url?: string;
  status: string;
  admin_notes?: string;
  reviewed_by?: string;
  created_at: string;
  updated_at: string;
}

function buildClaimTimeline(claim: ClaimDetail) {
  const events = [
    { label: "Claim Submitted", date: claim.created_at, active: true },
  ];

  if (claim.status === "APPROVED") {
    events.push({ label: "Approved", date: claim.updated_at, active: true });
  } else if (claim.status === "REJECTED") {
    events.push({ label: "Rejected", date: claim.updated_at, active: true });
  } else {
    events.push({ label: "Under Review", date: "", active: false });
    events.push({ label: "Decision", date: "", active: false });
  }

  return events;
}

function getStatusBadgeClass(status: string) {
  switch (status) {
    case "APPROVED":
      return "badge-accent";
    case "REJECTED":
      return "badge-red";
    case "PENDING":
      return "badge-amber";
    default:
      return "badge-gray";
  }
}

export default function ClaimDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [claim, setClaim] = useState<ClaimDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push("/auth/login");
      return;
    }

    api.get<ClaimDetail>(`/claims/${params.id}`)
      .then(setClaim)
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load claim"))
      .finally(() => setLoading(false));
  }, [params.id, user, authLoading, router]);

  if (authLoading || loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-text border-t-transparent" />
      </div>
    );
  }

  if (error || !claim) {
    return (
      <div className="min-h-screen bg-cream">
        <div className="mx-auto max-w-2xl px-4 py-16 text-center">
          <h1 className="text-xl font-bold text-text">Claim not found</h1>
          <p className="mt-2 text-xs text-text-muted">{error || "This claim doesn't exist or you don't have access."}</p>
          <Link href="/items" className="btn-primary mt-6 inline-flex text-xs">Browse Items</Link>
        </div>
      </div>
    );
  }

  const timeline = buildClaimTimeline(claim);

  return (
    <div className="min-h-screen bg-cream">
      <div className="mx-auto max-w-2xl px-4 py-8">
        <Link
          href={`/items/${claim.item_report_id}`}
          className="inline-flex items-center gap-1 text-xs text-text-muted hover:text-accent transition-colors"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to item
        </Link>

        <div className="mt-6 card p-6">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold text-text">Claim Details</h1>
            <span className={getStatusBadgeClass(claim.status)}>
              {claim.status ?? "_"}
            </span>
          </div>

          <dl className="mt-6 space-y-5">
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wider text-text-ghost">Evidence Provided</dt>
              <dd className="mt-2 rounded-lg bg-bg-elevated border border-border-light p-4 text-xs text-text-secondary whitespace-pre-wrap">
                {claim.evidence_description ?? "_"}
              </dd>
            </div>

            {claim.evidence_image_url && (
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wider text-text-ghost">Evidence Image</dt>
                <dd className="mt-2">
                  <img
                    src={claim.evidence_image_url}
                    alt="Evidence"
                    className="max-h-64 rounded-lg object-cover"
                  />
                </dd>
              </div>
            )}

            <div>
              <dt className="text-xs font-semibold uppercase tracking-wider text-text-ghost">Submitted</dt>
              <dd className="mt-1 text-xs text-text">
                {claim.created_at ? new Date(claim.created_at).toLocaleString() : "_"}
              </dd>
            </div>

            {claim.admin_notes && (
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wider text-text-ghost">Admin Notes</dt>
                <dd className="mt-2 rounded-lg bg-bg-elevated border border-border-light p-4 text-xs text-text-secondary">
                  {claim.admin_notes}
                </dd>
              </div>
            )}
          </dl>
        </div>

        <div className="mt-6 card p-6">
          <h2 className="text-lg font-bold text-text">Claim Timeline</h2>
          <div className="mt-4">
            <Timeline events={timeline} />
          </div>
        </div>
      </div>
    </div>
  );
}
