import Link from "next/link";

interface GameCardProps {
  title: string;
  description: string;
  href: string;
  icon: React.ReactNode;
  color: string;
}

export function GameCard({ title, description, href, icon }: GameCardProps) {
  return (
    <Link href={href} className="card-hover group flex flex-col overflow-hidden">
      <div className="flex h-36 items-center justify-center bg-gradient-to-br from-cream-100 to-cream-200">
        <div className="text-5xl transition-transform duration-300 group-hover:scale-110">
          {icon}
        </div>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <h3 className="text-lg font-bold text-ink">
          {title ?? "_"}
        </h3>
        <p className="mt-1 flex-1 text-sm text-ink-muted">
          {description ?? "_"}
        </p>
        <div className="mt-4">
          <span className="btn-primary inline-block text-sm">Play Now</span>
        </div>
      </div>
    </Link>
  );
}
