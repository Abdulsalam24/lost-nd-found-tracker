"use client";

import { usePathname } from "next/navigation";

export function GridBackground() {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");

  if (isAdmin) return null;

  return (
    <>
      <div className="grid-bg" aria-hidden="true" />
      <div className="grid-bg-coarse" aria-hidden="true" />
      <div className="grid-vignette" aria-hidden="true" />
    </>
  );
}
