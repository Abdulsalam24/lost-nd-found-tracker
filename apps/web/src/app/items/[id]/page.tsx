import { notFound } from "next/navigation";
import { serverFetch } from "@/lib/api";
import { StatusBadge } from "@/components/items/StatusBadge";
import { CategoryBadge } from "@/components/items/CategoryBadge";
import { Timeline } from "@/components/ui/Timeline";
import { ItemCard } from "@/components/items/ItemCard";
import { ItemActions } from "@/features/items/detail/ItemActions";
import { CommentSection } from "@/features/items/detail/SightingForm";
import { ImagePreview } from "@/features/items/detail/ImagePreview";
import Link from "next/link";

interface ItemDetail {
  id: string;
  type: string;
  category: string;
  title: string;
  description: string;
  location_id: string;
  location?: { id: string; name: string } | null;
  date_of_event: string;
  serial_number?: string;
  status: string;
  reporter_id: string;
  reporter?: { id: string; name: string; phone?: string | null };
  image_url?: string;
  created_at: string;
  updated_at: string;
}

interface MatchingItem {
  id: string;
  title: string;
  type: string;
  category: string;
  status: string;
  location_id: string;
  location?: { id: string; name: string } | null;
  date_of_event: string;
  image_url?: string;
  reporter?: { id: string; name: string } | null;
}

async function getItem(id: string): Promise<ItemDetail | null> {
  try {
    return await serverFetch<ItemDetail>(`/items/${id}`);
  } catch {
    return null;
  }
}

async function getMatches(id: string): Promise<MatchingItem[]> {
  try {
    const res = await serverFetch<{ data: MatchingItem[] }>(`/items/${id}/matches`);
    return res.data ?? [];
  } catch {
    return [];
  }
}

function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 30) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}

function buildTimeline(item: ItemDetail) {
  const events = [
    { label: "Reported", date: item.created_at, active: true },
  ];

  if (item.status === "UNDER_REVIEW" || item.status === "RECOVERED" || item.status === "DISPOSED") {
    events.push({ label: "Under Review", date: item.updated_at, active: true });
  }
  if (item.status === "RECOVERED") {
    events.push({ label: "Recovered", date: item.updated_at, active: true });
  }
  if (item.status === "DISPOSED") {
    events.push({ label: "Disposed", date: item.updated_at, active: true });
  }

  if (item.status === "ACTIVE") {
    events.push({ label: "Under Review", date: "", active: false });
    events.push({ label: "Recovered", date: "", active: false });
  } else if (item.status === "UNDER_REVIEW") {
    events.push({ label: "Recovered", date: "", active: false });
  }

  return events;
}

export default async function ItemDetailPage({ params }: { params: { id: string } }) {
  const [item, matches] = await Promise.all([
    getItem(params.id),
    getMatches(params.id),
  ]);

  if (!item) notFound();

  const timelineEvents = buildTimeline(item);
  const locationName = item.location?.name ?? "_";
  const isLost = item.type === "LOST";
  const reportedAgo = item.created_at
    ? formatRelativeTime(new Date(item.created_at))
    : "_";

  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-6xl px-4 py-6 sm:py-8">
        <Link
          href="/items"
          className="inline-flex items-center gap-1.5 text-xs text-text-muted hover:text-accent transition-colors"
        >
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to items
        </Link>

        <div className="mt-4 grid grid-cols-1 gap-6 sm:mt-6 lg:grid-cols-3 lg:gap-8">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-5 sm:space-y-6">
            {/* Header card: image thumbnail + item info side by side */}
            <div className="card overflow-hidden p-4 sm:p-5">
              <div className="flex flex-col sm:flex-row gap-4 sm:gap-5">
                {/* Compact image thumbnail */}
                <div className="h-48 w-full shrink-0 overflow-hidden rounded-xl bg-bg-elevated sm:h-44 sm:w-44">
                  {item.image_url ? (
                    <ImagePreview src={item.image_url} alt={item.title ?? "Item image"} />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <svg className="h-10 w-10 text-text-ghost" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  )}
                </div>

                {/* Item info */}
                <div className="flex min-w-0 flex-1 flex-col">
                  {/* Badges */}
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
                      isLost
                        ? "bg-red-500/15 text-red-400 border border-red-500/20"
                        : "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20"
                    }`}>
                      {item.type ?? "_"}
                    </span>
                    <CategoryBadge category={item.category} />
                    <StatusBadge status={item.status} />
                  </div>

                  {/* Title */}
                  <h1 className="mt-2 text-lg font-bold text-text leading-tight sm:text-xl">{item.title ?? "_"}</h1>

                  {/* Meta row */}
                  <div className="mt-auto flex flex-wrap items-center gap-x-4 gap-y-1 pt-3 text-[11px] text-text-muted">
                    <span className="inline-flex items-center gap-1">
                      <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                      {locationName}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                      {item.date_of_event ? new Date(item.date_of_event).toLocaleDateString() : "_"}
                    </span>
                    {item.serial_number && (
                      <span className="inline-flex items-center gap-1 font-mono">
                        <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" /></svg>
                        {item.serial_number}
                      </span>
                    )}
                  </div>

                  {/* Reporter */}
                  <div className="mt-2 flex items-center gap-2 border-t border-border-light pt-2">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-accent/10 text-[8px] font-bold text-accent">
                      {(item.reporter?.name ?? "?").charAt(0).toUpperCase()}
                    </span>
                    <span className="text-[11px] text-text-secondary">{item.reporter?.name ?? "_"}</span>
                    <span className="text-[10px] text-text-ghost">{reportedAgo}</span>
                  </div>
                </div>
              </div>

              {/* Description — below the image+info row */}
              {item.description && (
                <>
                  <div className="divider" />
                  <p className="text-xs text-text-secondary whitespace-pre-wrap leading-relaxed">{item.description}</p>
                </>
              )}
            </div>

            {/* Comments — immediately visible */}
            <CommentSection itemId={item.id} reporterId={item.reporter_id} />

            {/* Matches */}
            {matches.length > 0 && (
              <section>
                <div className="flex items-center gap-2 mb-4">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-yellow-500/10">
                    <svg className="h-3.5 w-3.5 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                  </span>
                  <h2 className="text-base font-bold text-text">Potential Matches</h2>
                  <span className="rounded-full bg-yellow-500/10 px-2 py-0.5 text-[10px] font-bold text-yellow-400">{matches.length}</span>
                </div>
                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                  {matches.map((m) => (
                    <ItemCard key={m.id} {...m} />
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Sidebar */}
          <aside className="space-y-5 sm:space-y-6">
            <div className="card p-4 sm:p-5">
              <h2 className="text-sm font-bold text-text">Status Timeline</h2>
              <div className="mt-4">
                <Timeline events={timelineEvents} />
              </div>
            </div>

            <ItemActions itemId={item.id} itemStatus={item.status} reportedBy={item.reporter_id} itemTitle={item.title} reporterPhone={item.reporter?.phone} />
          </aside>
        </div>
      </div>
    </div>
  );
}
