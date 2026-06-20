"use client";

import { usePathname } from "next/navigation";
import { Navbar } from "./Navbar";

export function LayoutShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");

  if (isAdmin) {
    return <>{children}</>;
  }

  return (
    <>
      <Navbar />
      <main className="relative z-10 flex-1 pb-20 md:pb-0">{children}</main>
    </>
  );
}
