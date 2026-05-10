const STATUS_MAP: Record<string, { className: string; label: string }> = {
  ACTIVE: { className: "badge-accent", label: "Active" },
  UNDER_REVIEW: { className: "badge-amber", label: "Under Review" },
  RECOVERED: { className: "badge-blue", label: "Recovered" },
  DISPOSED: { className: "badge-gray", label: "Disposed" },
  PENDING: { className: "badge-amber", label: "Pending" },
  APPROVED: { className: "badge-accent", label: "Approved" },
  REJECTED: { className: "badge-red", label: "Rejected" },
};

export function StatusBadge({ status }: { status: string }) {
  const entry = STATUS_MAP[status];

  return (
    <span className={entry?.className ?? "badge-gray"}>
      {entry?.label ?? status ?? "_"}
    </span>
  );
}
