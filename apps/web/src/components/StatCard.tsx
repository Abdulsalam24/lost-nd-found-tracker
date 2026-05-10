interface StatCardProps {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
  trend?: string;
}

export function StatCard({ label, value, icon, trend }: StatCardProps) {
  return (
    <div className="card group p-6 transition-shadow hover:shadow-lg hover:shadow-kraft/10">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-wider text-ink-faint">{label ?? "_"}</p>
        {icon && (
          <div className="text-coral" aria-hidden="true">
            {icon}
          </div>
        )}
      </div>
      <p className="mt-2 text-3xl font-bold text-ink">{value ?? "_"}</p>
      {trend && <p className="mt-1 text-xs text-ink-muted">{trend}</p>}
    </div>
  );
}
