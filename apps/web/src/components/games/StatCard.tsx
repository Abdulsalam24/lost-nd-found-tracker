interface StatCardProps {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
  trend?: string;
}

export function StatCard({ label, value, icon, trend }: StatCardProps) {
  return (
    <div className="card group p-6 transition-shadow hover:shadow-lg hover:shadow-black/10">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-wider text-text-muted">{label ?? "_"}</p>
        {icon && (
          <div className="text-accent" aria-hidden="true">
            {icon}
          </div>
        )}
      </div>
      <p className="mt-2 text-3xl font-bold text-text">{value ?? "_"}</p>
      {trend && <p className="mt-1 text-xs text-text-secondary">{trend}</p>}
    </div>
  );
}
