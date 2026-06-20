export const dynamic = "force-dynamic";

import dynamic_import from "next/dynamic";
import { serverFetch } from "@/lib/api";

const HeatmapDisplay = dynamic_import(
  () => import("@/features/heatmap/HeatmapDisplay").then((m) => m.HeatmapDisplay),
  { ssr: false, loading: () => <div className="mt-6 h-[500px] animate-pulse rounded-2xl bg-bg-elevated" /> }
);

interface HeatmapEntry {
  location_id: string;
  location_name: string;
  count: number;
}

async function getHeatmapData(): Promise<HeatmapEntry[]> {
  try {
    return await serverFetch<HeatmapEntry[]>("/heatmap");
  } catch {
    return [];
  }
}

export default async function HeatmapPage() {
  const data = await getHeatmapData();

  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-5xl px-4 py-8">
        <h1 className="section-title">Campus Heatmap</h1>
        <p className="section-subtitle">
          See where items are most commonly lost or found on campus.
        </p>
        <div className="mt-6">
          <HeatmapDisplay data={data} />
        </div>
      </div>
    </div>
  );
}
