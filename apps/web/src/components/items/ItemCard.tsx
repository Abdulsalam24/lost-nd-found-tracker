import Link from "next/link";
import Image from "next/image";

interface ItemCardProps {
  id: string;
  title: string;
  type: string;
  category: string;
  status?: string;
  location_id?: string;
  location?: { id: string; name: string } | null;
  date_of_event?: string;
  image_url?: string;
  reporter?: { id: string; name: string } | null;
  compact?: boolean;
}

export function ItemCard({
  id,
  title,
  type,
  category,
  location,
  date_of_event,
  image_url,
  reporter,
  compact = false,
}: ItemCardProps) {
  const locationName = location?.name;

  return (
    <Link href={`/items/${id}`} className="group overflow-hidden rounded-2xl border border-border-card bg-bg-card transition-all hover:shadow-xl hover:shadow-black/20">
      <div className="relative aspect-[4/3] overflow-hidden bg-bg-elevated">
        {image_url ? (
          <Image
            src={image_url}
            alt={title ?? "_"}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <svg className="h-8 w-8 text-text-ghost" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}
        <span className={`absolute top-2.5 left-2.5 rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide backdrop-blur-md sm:text-[10px] ${
          type === "LOST"
            ? "bg-red-500/80 text-white"
            : "bg-emerald-500/80 text-white"
        }`}>
          {type ?? "_"}
        </span>
      </div>
      <div className="px-3 py-3 sm:px-4 sm:py-3.5">
        <h3 className="font-heading text-sm font-semibold text-text transition-colors group-hover:text-accent line-clamp-1 sm:text-[15px]">
          {title ?? "_"}
        </h3>
        <div className="mt-1.5 flex items-center gap-2 text-xs text-text-muted">
          <span>{category ?? "_"}</span>
          {locationName && (
            <>
              <span className="text-text-ghost">&middot;</span>
              <span className="truncate">{locationName}</span>
            </>
          )}
        </div>
        {reporter?.name && (
          <p className="mt-1 text-[11px] text-text-ghost">by {reporter.name}</p>
        )}
      </div>
    </Link>
  );
}
