"use client";

import Link from "next/link";

interface HeroSectionProps {
  totalItems: number;
}

export function HeroSection({ totalItems }: HeroSectionProps) {
  return (
    <section className="relative overflow-hidden">
      <div className="flex flex-col items-center px-4 pt-8 sm:pt-32">
        <div className="mb-6 flex items-center gap-2 rounded-full border border-border-light bg-bg-card/80 px-5 py-2 backdrop-blur-sm">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-accent" />
          </span>
          <span className="text-xs text-text-secondary">
            {totalItems} items reported on campus
          </span>
        </div>

        <h1 className="max-w-4xl text-center text-4xl font-bold leading-[1.1] tracking-tight text-text sm:text-5xl lg:text-6xl">
          Find what you&apos;ve lost, return what you&apos;ve found
        </h1>

        <p className="mt-5 text-center text-xs tracking-[0.3em] uppercase text-text-ghost">
          &mdash; Campus &mdash; Community &mdash; Recovery &mdash;
        </p>

        <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Link href="/items/report-lost" className="btn-primary px-8 py-3">
            Report Lost Item
          </Link>
          <Link href="/items/report-found" className="btn-secondary px-8 py-3">
            Report Found Item
          </Link>
        </div>
      </div>
    </section>
  );
}
