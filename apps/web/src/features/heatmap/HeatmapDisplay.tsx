"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

interface HeatmapEntry {
  location_id: string;
  location_name: string;
  count: number;
}

const LOCATION_COORDS: Record<string, [number, number]> = {
  "Main Library": [8.4799, 4.5418],
  "Senate Building": [8.4812, 4.5405],
  "Faculty of Science": [8.4785, 4.5445],
  "Faculty of Engineering": [8.4770, 4.5465],
  "Faculty of Arts": [8.4808, 4.5432],
  "SUB Building": [8.4793, 4.5425],
  "Unilorin Stadium": [8.4755, 4.5400],
  "Faculty of Law": [8.4820, 4.5442],
  "Faculty of Education": [8.4825, 4.5418],
  "CBT Center": [8.4778, 4.5435],
  "Faculty of Management Sciences": [8.4815, 4.5455],
  "University Health Center": [8.4765, 4.5410],
  "Hostel Area": [8.4740, 4.5385],
  "Gate A (Tanke)": [8.4835, 4.5380],
  "Faculty of Agriculture": [8.4750, 4.5475],
  "University Library": [8.4799, 4.5418],
  "Faculty of Physical Sciences": [8.4785, 4.5445],
  "Faculty of Social Sciences": [8.4810, 4.5460],
  "Faculty of Life Sciences": [8.4790, 4.5455],
  "Faculty of CIS": [8.4775, 4.5440],
  "Faculty of Environmental Sciences": [8.4805, 4.5470],
  "Faculty of Pharmaceutical Sciences": [8.4760, 4.5450],
  "Faculty of Veterinary Medicine": [8.4745, 4.5470],
  "College of Health Sciences": [8.4765, 4.5410],
  "University Auditorium": [8.4802, 4.5412],
  "University Stadium": [8.4755, 4.5400],
  "Cafeteria 1": [8.4795, 4.5420],
  "Cafeteria 2": [8.4788, 4.5430],
  "Student Centre": [8.4793, 4.5425],
  "Hostel Block A": [8.4738, 4.5380],
  "Hostel Block B": [8.4735, 4.5390],
  "Hostel Block C": [8.4732, 4.5400],
  "Admin Block": [8.4812, 4.5405],
  "ICT Centre": [8.4778, 4.5435],
  "Sports Complex": [8.4755, 4.5395],
  "Main Parking Lot": [8.4830, 4.5390],
  "Campus Bus Stop": [8.4833, 4.5383],
  "Main Gate": [8.4835, 4.5380],
};

const CAMPUS_CENTER: [number, number] = [8.4790, 4.5425];

function getHeatColor(ratio: number): string {
  if (ratio > 0.75) return "#ef4444";
  if (ratio > 0.5) return "#f97316";
  if (ratio > 0.25) return "#fbbf24";
  return "#3f8378";
}

export function HeatmapDisplay({ data }: { data: HeatmapEntry[] }) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    const map = L.map(mapRef.current, {
      center: CAMPUS_CENTER,
      zoom: 16,
      scrollWheelZoom: true,
      zoomControl: true,
    });

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(map);

    mapInstanceRef.current = map;

    const maxCount = Math.max(...data.map((d) => d.count), 1);

    data.forEach((entry) => {
      const coords = LOCATION_COORDS[entry.location_name];
      if (!coords) return;

      const ratio = entry.count / maxCount;
      const color = getHeatColor(ratio);
      const radius = 20 + ratio * 30;

      // Glow circle (larger, translucent)
      L.circle(coords, {
        radius: radius * 3,
        fillColor: color,
        fillOpacity: 0.15,
        stroke: false,
      }).addTo(map);

      // Core circle
      L.circleMarker(coords, {
        radius: 8 + ratio * 8,
        fillColor: color,
        color: color,
        weight: 2,
        opacity: 0.8,
        fillOpacity: 0.6,
      })
        .addTo(map)
        .bindPopup(
          `<div style="text-align:center;font-family:Manrope,system-ui,sans-serif;padding:4px;">
            <strong style="font-size:13px;color:#f0fdf4;">${entry.location_name}</strong><br/>
            <span style="color:${color};font-weight:700;font-size:16px;">${entry.count}</span>
            <span style="color:#9ca3af;font-size:12px;"> item${entry.count !== 1 ? "s" : ""}</span>
          </div>`,
          { className: "dark-popup" }
        );
    });

    setTimeout(() => map.invalidateSize(), 100);

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, [data]);

  return (
    <div className="space-y-4">
      <div className="card overflow-hidden">
        <div
          ref={mapRef}
          className="h-[350px] w-full sm:h-[500px] lg:h-[600px]"
          role="img"
          aria-label="Interactive heatmap of University of Ilorin campus showing item loss hotspots"
        />
      </div>

      {/* Legend */}
      <div className="card px-4 py-3 sm:px-6 sm:py-4">
        <div className="flex flex-wrap items-center gap-4 text-xs text-text-muted sm:gap-6">
          <span className="font-semibold text-text">Intensity:</span>
          <div className="flex items-center gap-1.5">
            <div className="h-3 w-6 rounded-sm" style={{ background: "#3f8378" }} />
            <span>Low</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-3 w-6 rounded-sm" style={{ background: "#fbbf24" }} />
            <span>Medium</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-3 w-6 rounded-sm" style={{ background: "#f97316" }} />
            <span>High</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-3 w-6 rounded-sm" style={{ background: "#ef4444" }} />
            <span>Very High</span>
          </div>
        </div>
      </div>

      {/* Location table */}
      {data.length > 0 && (
        <div className="card overflow-hidden">
          <div className="px-4 py-3 border-b border-border sm:px-6 sm:py-4">
            <h3 className="text-sm font-bold text-text">Location Breakdown</h3>
          </div>
          <div className="divide-y divide-border">
            {[...data]
              .sort((a, b) => b.count - a.count)
              .map((entry) => {
                const mc = Math.max(...data.map((d) => d.count), 1);
                const ratio = entry.count / mc;
                const color = getHeatColor(ratio);
                return (
                  <div key={entry.location_id} className="flex items-center justify-between px-4 py-2.5 sm:px-6 sm:py-3">
                    <div className="flex items-center gap-3">
                      <div
                        className="flex h-7 w-7 items-center justify-center rounded-lg sm:h-8 sm:w-8"
                        style={{ background: `${color}20` }}
                      >
                        <svg className="h-3.5 w-3.5 sm:h-4 sm:w-4" style={{ color }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        </svg>
                      </div>
                      <span className="text-xs font-medium text-text">{entry.location_name}</span>
                    </div>
                    <span className="text-xs font-bold" style={{ color }}>{entry.count}</span>
                  </div>
                );
              })}
          </div>
        </div>
      )}
    </div>
  );
}
