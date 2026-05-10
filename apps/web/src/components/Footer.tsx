import Link from "next/link";

const QUICK_LINKS = [
  { href: "/items", label: "Browse Items" },
  { href: "/stats", label: "Statistics" },
  { href: "/games", label: "Games" },
  { href: "/leaderboard", label: "Leaderboard" },
];

export function Footer() {
  return (
    <footer className="border-t border-cream-300 bg-ink">
      <div className="mx-auto max-w-7xl px-4 py-12">
        <div className="flex flex-col gap-8 sm:flex-row sm:justify-between">
          <div className="flex flex-col gap-3">
            <span className="text-lg font-bold uppercase tracking-[0.15em] text-cream">Lost & Found</span>
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-ink-ghost">Pantry Provisions</p>
            <p className="font-script italic text-cream-300 text-sm mt-1">Great Quality</p>
          </div>

          <nav aria-label="Footer navigation">
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-ink-ghost">
              Quick Links
            </h3>
            <ul className="flex flex-col gap-2">
              {QUICK_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-cream-300 transition-colors hover:text-coral-light"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="my-8 border-t border-white/10" />

        <div className="flex flex-col items-center gap-2 sm:flex-row sm:justify-between">
          <p className="text-xs text-ink-ghost">
            &copy; {new Date().getFullYear()} UniLorin Lost &amp; Found
          </p>
          <p className="text-xs text-ink-ghost">University of Ilorin</p>
        </div>
      </div>
    </footer>
  );
}
