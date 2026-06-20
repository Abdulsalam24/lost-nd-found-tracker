import Link from "next/link";
import Image from "next/image";

interface ItemCardProps {
  id: string;
  title: string;
  type: string;
  category: string;
  status?: string;
  location_id?: string;
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
  location_id,
  date_of_event,
  image_url,
  reporter,
  compact = false,
}: ItemCardProps) {
  return (
    <Link href={`/items/${id}`} className="card-hover group overflow-hidden rounded-lg">
      <div className="relative aspect-[4/3] overflow-hidden bg-bg-elevated">
        {image_url ? (
          <Image
            src={image_url}
            alt={title ?? "_"}
            fill
            sizes="(max-width: 640px) 33vw, (max-width: 1024px) 50vw, 25vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <svg className="h-6 w-6 text-text-ghost sm:h-8 sm:w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}
        <span className={`absolute top-1.5 left-1.5 rounded-full px-1.5 py-px text-[7px] font-bold uppercase tracking-wide backdrop-blur-md sm:text-[8px] ${
          type === "LOST"
            ? "bg-red-500/80 text-white"
            : "bg-emerald-500/80 text-white"
        }`}>
          {type ?? "_"}
        </span>
      </div>
      <div className="p-2 sm:p-2.5">
        <h3 className="text-[10px] font-semibold text-text transition-colors group-hover:text-accent line-clamp-1 sm:text-[11px]">
          {title ?? "_"}
        </h3>
        {reporter?.name && (
          <p className="mt-0.5 text-[8px] text-text-muted sm:text-[9px]">by {reporter.name}</p>
        )}
        <p className="mt-0.5 text-[8px] text-text-ghost sm:text-[9px]">{category ?? "_"}</p>
        {!compact && (location_id || date_of_event) && (
          <div className="mt-1 flex items-center justify-between">
            {location_id && (
              <p className="flex items-center gap-0.5 text-[8px] text-text-muted sm:text-[9px]">
                <svg className="h-2.5 w-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                </svg>
                <span className="truncate max-w-[80px]">{location_id}</span>
              </p>
            )}
            {date_of_event && (
              <time className="text-[8px] text-text-ghost sm:text-[9px]" dateTime={date_of_event}>
                {new Date(date_of_event).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
              </time>
            )}
          </div>
        )}
      </div>
    </Link>
  );
}
