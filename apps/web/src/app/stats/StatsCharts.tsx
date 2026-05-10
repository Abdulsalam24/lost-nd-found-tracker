"use client";

import { useEffect, useRef } from "react";

declare global {
  interface Window {
    Chart: any;
  }
}

interface CategoryStat {
  category: string;
  count: number;
}

interface MonthlyStat {
  month: string;
  count: number;
}

interface StatsChartsProps {
  categoryStats: CategoryStat[];
  monthlyStats: MonthlyStat[];
  recoveryRate: number;
}

const CATEGORY_COLORS = [
  "#c96b55", "#c4a882", "#6b8f71", "#5b7fa5",
  "#9a7eb8", "#d4935e", "#7a9e9f", "#b07d62",
];

export function StatsCharts({ categoryStats, monthlyStats, recoveryRate }: StatsChartsProps) {
  const pieRef = useRef<HTMLCanvasElement>(null);
  const barRef = useRef<HTMLCanvasElement>(null);
  const gaugeRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      if (typeof window.Chart === "undefined") return;
      clearInterval(interval);

      if (pieRef.current && categoryStats.length > 0) {
        new window.Chart(pieRef.current, {
          type: "pie",
          data: {
            labels: categoryStats.map((c) => c.category),
            datasets: [{
              data: categoryStats.map((c) => c.count),
              backgroundColor: CATEGORY_COLORS.slice(0, categoryStats.length),
              borderColor: "#ffffff",
              borderWidth: 2,
            }],
          },
          options: {
            responsive: true,
            plugins: {
              legend: {
                position: "bottom",
                labels: { color: "#1a1a1a", padding: 16 },
              },
            },
          },
        });
      }

      if (barRef.current && monthlyStats.length > 0) {
        new window.Chart(barRef.current, {
          type: "bar",
          data: {
            labels: monthlyStats.map((m) => m.month),
            datasets: [{
              label: "Items Reported",
              data: monthlyStats.map((m) => m.count),
              backgroundColor: "#c96b55",
              borderRadius: 4,
            }],
          },
          options: {
            responsive: true,
            plugins: {
              legend: { display: false },
            },
            scales: {
              y: {
                beginAtZero: true,
                ticks: { color: "#6b6358" },
                grid: { color: "rgba(0,0,0,0.06)" },
              },
              x: {
                ticks: { color: "#6b6358" },
                grid: { color: "rgba(0,0,0,0.06)" },
              },
            },
          },
        });
      }

      if (gaugeRef.current) {
        new window.Chart(gaugeRef.current, {
          type: "doughnut",
          data: {
            labels: ["Recovered", "Remaining"],
            datasets: [{
              data: [recoveryRate, 100 - recoveryRate],
              backgroundColor: ["#c96b55", "#e0d5c5"],
              borderWidth: 0,
            }],
          },
          options: {
            responsive: true,
            circumference: 180,
            rotation: 270,
            cutout: "75%",
            plugins: {
              legend: { display: false },
            },
          },
        });
      }
    }, 100);

    return () => clearInterval(interval);
  }, [categoryStats, monthlyStats, recoveryRate]);

  return (
    <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
      <div className="card p-6">
        <h2 className="mb-4 text-lg font-bold text-ink">Items by Category</h2>
        <div className="mx-auto max-w-xs">
          <canvas ref={pieRef} aria-label="Pie chart showing items by category" role="img" />
        </div>
      </div>

      <div className="card p-6">
        <h2 className="mb-4 text-lg font-bold text-ink">Items by Month</h2>
        <canvas ref={barRef} aria-label="Bar chart showing items reported per month" role="img" />
      </div>

      <div className="card p-6 lg:col-span-2">
        <h2 className="mb-4 text-lg font-bold text-ink text-center">Recovery Rate</h2>
        <div className="mx-auto max-w-xs">
          <canvas ref={gaugeRef} aria-label="Gauge showing recovery rate percentage" role="img" />
          <p className="text-center text-3xl font-bold text-coral -mt-8">
            {recoveryRate ?? 0}%
          </p>
        </div>
      </div>
    </div>
  );
}
