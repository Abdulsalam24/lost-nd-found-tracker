"use client";

interface StatsBarProps {
  totalItems: number;
  totalRecovered: number;
  recoveryRate: number;
}

export function StatsBar({ totalItems, totalRecovered, recoveryRate }: StatsBarProps) {
  return (
    <section className="relative z-10 mx-auto max-w-lg px-4 py-6 sm:max-w-3xl sm:py-10">
      <div className="card flex items-center divide-x divide-border/50 sm:rounded-2xl">
        <div className="flex-1 py-3 text-center sm:py-5">
          <p className="text-lg font-bold text-text sm:text-3xl">{totalItems ?? "_"}</p>
          <p className="mt-0.5 text-[8px] font-semibold uppercase tracking-wider text-text-muted sm:mt-1 sm:text-[10px]">Reported</p>
        </div>
        <div className="flex-1 py-3 text-center sm:py-5">
          <p className="text-lg font-bold text-text sm:text-3xl">{totalRecovered ?? "_"}</p>
          <p className="mt-0.5 text-[8px] font-semibold uppercase tracking-wider text-text-muted sm:mt-1 sm:text-[10px]">Recovered</p>
        </div>
        <div className="flex-1 py-3 text-center sm:py-5">
          <p className="text-lg font-bold text-accent sm:text-3xl">{`${recoveryRate ?? 0}%`}</p>
          <p className="mt-0.5 text-[8px] font-semibold uppercase tracking-wider text-text-muted sm:mt-1 sm:text-[10px]">Recovery Rate</p>
        </div>
      </div>
    </section>
  );
}
