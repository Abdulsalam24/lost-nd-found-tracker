import { notFound } from "next/navigation";
import Link from "next/link";
import { serverFetch } from "@/lib/api";
import { StatusBadge } from "@/components/StatusBadge";
import { Timeline } from "@/components/Timeline";

interface ClaimDetail {
  id: string;
  item_report_id: string;
  claimant_id: string;
  evidence_description: string;
  status: string;
  admin_notes?: string;
  reviewed_by?: string;
  created_at: string;
  updated_at: string;
}

async function getClaim(id: string): Promise<ClaimDetail | null> {
  try {
    return await serverFetch<ClaimDetail>(`/claims/${id}`);
  } catch {
    return null;
  }
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

export default async function ClaimDetailPage({ params }: { params: { id: string } }) {
  const claim = await getClaim(params.id);
  if (!claim) notFound();

  const timeline = buildClaimTimeline(claim);

  return (
    <div className="min-h-screen bg-cream">
      <div className="mx-auto max-w-2xl px-4 py-8">
        <Link
          href={`/items/${claim.item_report_id}`}
          className="inline-flex items-center gap-1 text-sm text-ink-muted hover:text-coral transition-colors"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to item
        </Link>

        <div className="mt-6 card p-6">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold text-ink">Claim Details</h1>
            <span className={getStatusBadgeClass(claim.status)}>
              {claim.status ?? "_"}
            </span>
          </div>

          <dl className="mt-6 space-y-5">
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wider text-ink-faint">Evidence Provided</dt>
              <dd className="mt-2 rounded-lg bg-cream-100 border border-cream-300 p-4 text-sm text-ink-muted whitespace-pre-wrap">
                {claim.evidence_description ?? "_"}
              </dd>
            </div>

            <div>
              <dt className="text-xs font-semibold uppercase tracking-wider text-ink-faint">Submitted</dt>
              <dd className="mt-1 text-sm text-ink">
                {claim.created_at ? new Date(claim.created_at).toLocaleString() : "_"}
              </dd>
            </div>

            {claim.admin_notes && (
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wider text-ink-faint">Admin Notes</dt>
                <dd className="mt-2 rounded-lg bg-cream-100 border border-cream-300 p-4 text-sm text-ink-muted">
                  {claim.admin_notes}
                </dd>
              </div>
            )}
          </dl>
        </div>

        <div className="mt-6 card p-6">
          <h2 className="text-lg font-bold text-ink">Claim Timeline</h2>
          <div className="mt-4">
            <Timeline events={timeline} />
          </div>
        </div>
      </div>
    </div>
  );
}
