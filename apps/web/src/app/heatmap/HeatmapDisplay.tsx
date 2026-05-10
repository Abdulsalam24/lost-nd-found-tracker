"use client";

import { useState } from "react";

interface HeatmapEntry {
  location_id: string;
  location_name: string;
  count: number;
}

const LOCATION_COORDS: Record<string, { x: number; y: number }> = {
  library: { x: 400, y: 200 },
  senate: { x: 350, y: 120 },
  "faculty-arts": { x: 200, y: 180 },
  "faculty-sciences": { x: 550, y: 250 },
  "faculty-engineering": { x: 600, y: 150 },
  "faculty-education": { x: 150, y: 300 },
  "faculty-law": { x: 300, y: 350 },
  "faculty-management": { x: 450, y: 350 },
  "faculty-social-sciences": { x: 250, y: 250 },
  "faculty-life-sciences": { x: 500, y: 180 },
  "faculty-agriculture": { x: 100, y: 150 },
  "faculty-cis": { x: 650, y: 300 },
  "faculty-env": { x: 350, y: 280 },
  "faculty-pharma": { x: 550, y: 350 },
  "faculty-vet": { x: 100, y: 350 },
  "health-sciences": { x: 700, y: 200 },
  auditorium: { x: 400, y: 100 },
  stadium: { x: 700, y: 350 },
  "cafeteria-1": { x: 300, y: 200 },
  "cafeteria-2": { x: 500, y: 300 },
  "student-center": { x: 400, y: 300 },
  "hostel-block-a": { x: 150, y: 400 },
  "hostel-block-b": { x: 250, y: 400 },
  "hostel-block-c": { x: 350, y: 400 },
  "admin-block": { x: 400, y: 50 },
  "ict-center": { x: 600, y: 100 },
  "sports-complex": { x: 650, y: 400 },
  "parking-lot": { x: 200, y: 50 },
  "bus-stop": { x: 100, y: 50 },
  "gate-main": { x: 50, y: 250 },
};

export function HeatmapDisplay({ data }: { data: HeatmapEntry[] }) {
  const [tooltip, setTooltip] = useState<{ name: string; count: number; x: number; y: number } | null>(null);

  const maxCount = Math.max(...data.map((d) => d.count), 1);

  return (
    <div className="card overflow-hidden">
      <div className="relative">
        <svg
          viewBox="0 0 800 460"
          className="w-full"
          role="img"
          aria-label="Campus heatmap showing item loss hotspots"
        >
          <rect x="20" y="20" width="760" height="420" rx="16" fill="#faf8f5" stroke="#e0d5c5" strokeWidth="2" />
          <text x="400" y="445" textAnchor="middle" fill="#9a9084" fontSize="12">University of Ilorin Campus</text>

          <line x1="50" y1="250" x2="750" y2="250" stroke="#e0d5c5" strokeWidth="3" strokeDasharray="8 4" />
          <line x1="400" y1="30" x2="400" y2="440" stroke="#e0d5c5" strokeWidth="3" strokeDasharray="8 4" />

          {data.map((entry) => {
            const coords = LOCATION_COORDS[entry.location_id];
            if (!coords) return null;
            const opacity = 0.2 + (entry.count / maxCount) * 0.8;
            const radius = 16 + (entry.count / maxCount) * 24;

            return (
              <g key={entry.location_id}>
                <circle
                  cx={coords.x}
                  cy={coords.y}
                  r={radius}
                  fill="#c96b55"
                  opacity={opacity}
                  className="cursor-pointer transition-all hover:stroke-ink hover:stroke-2"
                  onMouseEnter={() => setTooltip({ name: entry.location_name, count: entry.count, x: coords.x, y: coords.y })}
                  onMouseLeave={() => setTooltip(null)}
                />
                <text
                  x={coords.x}
                  y={coords.y + 4}
                  textAnchor="middle"
                  fill="#ffffff"
                  fontSize="11"
                  fontWeight="bold"
                  className="pointer-events-none"
                >
                  {entry.count}
                </text>
              </g>
            );
          })}
        </svg>

        {tooltip && (
          <div
            className="pointer-events-none absolute z-10 rounded-lg bg-ink border border-ink-light px-3 py-2 text-xs text-cream shadow-lg"
            style={{
              left: `${(tooltip.x / 800) * 100}%`,
              top: `${(tooltip.y / 460) * 100 - 8}%`,
              transform: "translate(-50%, -100%)",
            }}
          >
            <p className="font-semibold">{tooltip.name}</p>
            <p className="text-coral-light">{tooltip.count} item{tooltip.count !== 1 ? "s" : ""}</p>
          </div>
        )}
      </div>

      <div className="border-t border-cream-300 px-6 py-4">
        <div className="flex items-center gap-4 text-xs text-ink-faint">
          <span>Intensity:</span>
          <div className="flex items-center gap-1">
            <div className="h-3 w-3 rounded-full bg-coral opacity-20" />
            <span>Low</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="h-3 w-3 rounded-full bg-coral opacity-60" />
            <span>Medium</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="h-3 w-3 rounded-full bg-coral" />
            <span>High</span>
          </div>
        </div>
      </div>
    </div>
  );
}
