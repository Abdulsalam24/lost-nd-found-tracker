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
      <div className="flex h-36 items-center justify-center bg-bg-elevated">
        <div className="text-5xl transition-transform duration-300 group-hover:scale-110">
          {icon}
        </div>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <h3 className="text-lg font-semibold text-text">
          {title ?? "_"}
        </h3>
        <p className="mt-1 flex-1 text-sm text-text-muted">
          {description ?? "_"}
        </p>
        <div className="mt-4">
          <span className="text-sm font-semibold text-accent group-hover:text-accent-light transition-colors">
            Play Now &rarr;
          </span>
        </div>
      </div>
    </Link>
  );
}
