import Link from "next/link";
import { StatusBadge } from "./StatusBadge";
import { CategoryBadge } from "./CategoryBadge";

interface ItemCardProps {
  id: string;
  title: string;
  type: string;
  category: string;
  status: string;
  location_id: string;
  date_of_event: string;
  image_url?: string;
}

export function ItemCard({
  id,
  title,
  type,
  category,
  status,
  location_id,
  date_of_event,
  image_url,
}: ItemCardProps) {
  return (
    <Link href={`/items/${id}`} className="card-hover group overflow-hidden">
      <div className="aspect-[4/3] overflow-hidden bg-bg-elevated">
        {image_url ? (
          <img
            src={image_url}
            alt={title ?? "_"}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <svg
              className="h-12 w-12 text-text-ghost"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
        )}
      </div>

      <div className="p-4">
        <div className="mb-2 flex items-center gap-2">
          <span
            className={`text-xs font-bold uppercase tracking-wider ${
              type === "LOST" ? "text-red-400" : "text-accent"
            }`}
          >
            {type ?? "_"}
          </span>
          <CategoryBadge category={category} />
        </div>

        <h3 className="text-sm font-semibold text-text transition-colors group-hover:text-accent line-clamp-1">
          {title ?? "_"}
        </h3>

        <p className="mt-1 flex items-center gap-1 text-xs text-text-muted">
          <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          {location_id ?? "_"}
        </p>

        <div className="mt-3 flex items-center justify-between">
          <StatusBadge status={status} />
          <time className="text-xs text-text-ghost" dateTime={date_of_event}>
            {date_of_event ? new Date(date_of_event).toLocaleDateString() : "_"}
          </time>
        </div>
      </div>
    </Link>
  );
}
