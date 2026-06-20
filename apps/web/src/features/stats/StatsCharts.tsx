"use client";

import { useEffect, useRef } from "react";
import {
  Chart,
  DoughnutController,
  BarController,
  ArcElement,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from "chart.js";

Chart.register(
  DoughnutController,
  BarController,
  ArcElement,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
);

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
  "#3f8378", "#f87171", "#fbbf24", "#60a5fa",
  "#a78bfa", "#f97316", "#2dd4bf", "#fb923c",
];

export function StatsCharts({ categoryStats, monthlyStats, recoveryRate }: StatsChartsProps) {
  const pieRef = useRef<HTMLCanvasElement>(null);
  const barRef = useRef<HTMLCanvasElement>(null);
  const gaugeRef = useRef<HTMLCanvasElement>(null);
  const chartsRef = useRef<Chart[]>([]);

  useEffect(() => {
    chartsRef.current.forEach((c) => c.destroy());
    chartsRef.current = [];

    const isDark = document.documentElement.classList.contains("dark") ||
      !document.documentElement.classList.contains("light");

    const textColor = isDark ? "#9ca3af" : "#6b7280";
    const gridColor = isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)";
    const borderColor = isDark ? "#1f2e1f" : "#e5e7eb";

    if (pieRef.current && categoryStats.length > 0) {
      chartsRef.current.push(
        new Chart(pieRef.current, {
          type: "doughnut",
          data: {
            labels: categoryStats.map((c) => c.category),
            datasets: [{
              data: categoryStats.map((c) => c.count),
              backgroundColor: CATEGORY_COLORS.slice(0, categoryStats.length),
              borderColor,
              borderWidth: 2,
            }],
          },
          options: {
            responsive: true,
            cutout: "60%",
            plugins: {
              legend: {
                position: "bottom",
                labels: { color: textColor, padding: 16, usePointStyle: true, pointStyleWidth: 8 },
              },
            },
          },
        }),
      );
    }

    if (barRef.current && monthlyStats.length > 0) {
      chartsRef.current.push(
        new Chart(barRef.current, {
          type: "bar",
          data: {
            labels: monthlyStats.map((m) => m.month),
            datasets: [{
              label: "Items Reported",
              data: monthlyStats.map((m) => m.count),
              backgroundColor: "#3f8378",
              borderRadius: 6,
              borderSkipped: false,
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
                ticks: { color: textColor },
                grid: { color: gridColor },
                border: { color: "transparent" },
              },
              x: {
                ticks: { color: textColor },
                grid: { display: false },
                border: { color: "transparent" },
              },
            },
          },
        }),
      );
    }

    if (gaugeRef.current) {
      chartsRef.current.push(
        new Chart(gaugeRef.current, {
          type: "doughnut",
          data: {
            labels: ["Recovered", "Remaining"],
            datasets: [{
              data: [recoveryRate, 100 - recoveryRate],
              backgroundColor: ["#3f8378", isDark ? "#1f2e1f" : "#e5e7eb"],
              borderWidth: 0,
            }],
          },
          options: {
            responsive: true,
            circumference: 180,
            rotation: 270,
            cutout: "78%",
            plugins: {
              legend: { display: false },
              tooltip: { enabled: false },
            },
          },
        }),
      );
    }

    return () => {
      chartsRef.current.forEach((c) => c.destroy());
      chartsRef.current = [];
    };
  }, [categoryStats, monthlyStats, recoveryRate]);

  return (
    <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
      <div className="card p-6">
        <h2 className="mb-1 text-base font-bold text-text">Items by Category</h2>
        <p className="mb-4 text-xs text-text-muted">Distribution of reported items</p>
        {categoryStats.length > 0 ? (
          <div className="mx-auto max-w-xs">
            <canvas ref={pieRef} aria-label="Doughnut chart showing items by category" role="img" />
          </div>
        ) : (
          <p className="py-8 text-center text-xs text-text-ghost">No category data yet</p>
        )}
      </div>

      <div className="card p-6">
        <h2 className="mb-1 text-base font-bold text-text">Monthly Reports</h2>
        <p className="mb-4 text-xs text-text-muted">Items reported over time</p>
        {monthlyStats.length > 0 ? (
          <canvas ref={barRef} aria-label="Bar chart showing items reported per month" role="img" />
        ) : (
          <p className="py-8 text-center text-xs text-text-ghost">No monthly data yet</p>
        )}
      </div>

      <div className="card p-6 lg:col-span-2">
        <h2 className="mb-1 text-base font-bold text-text text-center">Recovery Rate</h2>
        <p className="mb-4 text-xs text-text-muted text-center">Percentage of items successfully returned</p>
        <div className="mx-auto max-w-[200px]">
          <canvas ref={gaugeRef} aria-label="Gauge showing recovery rate percentage" role="img" />
          <p className="text-center text-3xl font-bold text-accent -mt-6">
            {recoveryRate ?? 0}%
          </p>
          <p className="text-center text-xs text-text-ghost mt-1">of items recovered</p>
        </div>
      </div>
    </div>
  );
}
