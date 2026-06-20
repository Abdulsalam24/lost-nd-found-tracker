import { notFound } from "next/navigation";
import { serverFetch } from "@/lib/api";
import { StatusBadge } from "@/components/items/StatusBadge";
import { CategoryBadge } from "@/components/items/CategoryBadge";
import { Timeline } from "@/components/ui/Timeline";
import { ItemCard } from "@/components/items/ItemCard";
import { ItemActions } from "@/features/items/detail/ItemActions";
import { SightingForm } from "@/features/items/detail/SightingForm";
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

  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-6xl px-4 py-6 sm:py-8">
        <Link
          href="/items"
          className="inline-flex items-center gap-1 text-xs text-text-muted hover:text-accent transition-colors"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to items
        </Link>

        <div className="mt-4 grid grid-cols-1 gap-6 sm:mt-6 lg:grid-cols-3 lg:gap-8">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-5 sm:space-y-6">
            {/* Image */}
            <div className="card overflow-hidden">
              {item.image_url ? (
                <img
                  src={item.image_url}
                  alt={item.title ?? "Item image"}
                  className="w-full object-cover"
                  style={{ maxHeight: 420 }}
                />
              ) : (
                <div className="flex h-48 items-center justify-center bg-bg-elevated sm:h-64">
                  <svg className="h-12 w-12 text-text-ghost sm:h-16 sm:w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              )}
            </div>

            {/* Details */}
            <div className="card p-4 sm:p-6">
              <div className="flex flex-wrap items-center gap-2">
                <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
                  item.type === "LOST"
                    ? "bg-red-500/15 text-red-400 border border-red-500/20"
                    : "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20"
                }`}>
                  {item.type ?? "_"}
                </span>
                <CategoryBadge category={item.category} />
                <StatusBadge status={item.status} />
              </div>

              <h1 className="mt-4 text-xl font-bold text-text sm:text-2xl">{item.title ?? "_"}</h1>

              {item.reporter?.name && (
                <p className="mt-1 text-xs text-text-muted">Reported by <span className="font-medium text-text-secondary">{item.reporter.name}</span></p>
              )}

              <dl className="mt-5 grid grid-cols-2 gap-4 text-xs sm:grid-cols-3">
                <div>
                  <dt className="font-semibold text-text-ghost uppercase tracking-wider">Location</dt>
                  <dd className="mt-1 text-text">{locationName}</dd>
                </div>
                <div>
                  <dt className="font-semibold text-text-ghost uppercase tracking-wider">Date</dt>
                  <dd className="mt-1 text-text">
                    {item.date_of_event ? new Date(item.date_of_event).toLocaleDateString() : "_"}
                  </dd>
                </div>
                {item.serial_number && (
                  <div>
                    <dt className="font-semibold text-text-ghost uppercase tracking-wider">Serial Number</dt>
                    <dd className="mt-1 font-mono text-text">{item.serial_number}</dd>
                  </div>
                )}
              </dl>

              <div className="divider" />

              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-text-ghost">Description</h3>
                <p className="mt-2 text-xs text-text-secondary whitespace-pre-wrap leading-relaxed">{item.description ?? "_"}</p>
              </div>
            </div>

            {/* Matches */}
            {matches.length > 0 && (
              <section>
                <h2 className="text-lg font-bold text-text mb-4">Potential Matches</h2>
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
            <div className="card p-4 sm:p-6">
              <h2 className="text-base font-bold text-text sm:text-lg">Status Timeline</h2>
              <div className="mt-4">
                <Timeline events={timelineEvents} />
              </div>
            </div>

            <ItemActions itemId={item.id} itemStatus={item.status} reportedBy={item.reporter_id} itemTitle={item.title} reporterPhone={item.reporter?.phone} />

            {item.type === "LOST" && item.status === "ACTIVE" && (
              <div className="card p-4 sm:p-6">
                <h2 className="text-base font-bold text-text sm:text-lg">Spotted This Item?</h2>
                <p className="mt-1 text-xs text-text-muted">Help the owner by reporting where you saw it.</p>
                <SightingForm itemId={item.id} reporterId={item.reporter_id} />
              </div>
            )}
          </aside>
        </div>
      </div>
    </div>
  );
}
