import { notFound } from "next/navigation";
import { serverFetch } from "@/lib/api";
import { StatusBadge } from "@/components/StatusBadge";
import { CategoryBadge } from "@/components/CategoryBadge";
import { Timeline } from "@/components/Timeline";
import { ItemCard } from "@/components/ItemCard";
import { SightingForm } from "./SightingForm";
import { ClaimButton } from "./ClaimButton";
import Link from "next/link";

interface ItemDetail {
  id: string;
  type: string;
  category: string;
  title: string;
  description: string;
  location_id: string;
  date_of_event: string;
  serial_number?: string;
  status: string;
  reported_by: string;
  image_url?: string;
  created_at: string;
  updated_at: string;
}

interface Sighting {
  id: string;
  description: string;
  location_id?: string;
  spotted_at: string;
  created_at: string;
}

interface MatchingItem {
  id: string;
  title: string;
  type: string;
  category: string;
  status: string;
  location_id: string;
  date_of_event: string;
  image_url?: string;
}

async function getItem(id: string): Promise<ItemDetail | null> {
  try {
    return await serverFetch<ItemDetail>(`/items/${id}`);
  } catch {
    return null;
  }
}

async function getSightings(id: string): Promise<Sighting[]> {
  try {
    const res = await serverFetch<{ data: Sighting[] }>(`/items/${id}/sightings`);
    return res.data ?? [];
  } catch {
    return [];
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
  const [item, sightings, matches] = await Promise.all([
    getItem(params.id),
    getSightings(params.id),
    getMatches(params.id),
  ]);

  if (!item) notFound();

  const timelineEvents = buildTimeline(item);

  return (
    <div className="min-h-screen bg-cream">
      <div className="mx-auto max-w-6xl px-4 py-8">
        <Link
          href="/items"
          className="inline-flex items-center gap-1 text-sm text-ink-muted hover:text-coral transition-colors"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to items
        </Link>

        <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <div className="card overflow-hidden">
              {item.image_url ? (
                <img
                  src={item.image_url}
                  alt={item.title ?? "Item image"}
                  className="w-full object-cover"
                  style={{ maxHeight: 420 }}
                />
              ) : (
                <div className="flex h-64 items-center justify-center bg-cream-200">
                  <svg className="h-16 w-16 text-cream-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              )}
            </div>

            <div className="card p-6">
              <div className="flex flex-wrap items-center gap-2">
                <span className={`badge-${item.type === "LOST" ? "red" : "accent"}`}>
                  {item.type ?? "_"}
                </span>
                <CategoryBadge category={item.category} />
                <StatusBadge status={item.status} />
              </div>

              <h1 className="mt-4 text-2xl font-bold text-ink">{item.title ?? "_"}</h1>

              <dl className="mt-5 grid grid-cols-2 gap-4 text-sm">
                <div>
                  <dt className="font-semibold text-ink-faint uppercase tracking-wider text-xs">Location</dt>
                  <dd className="mt-1 text-ink">{item.location_id ?? "_"}</dd>
                </div>
                <div>
                  <dt className="font-semibold text-ink-faint uppercase tracking-wider text-xs">Date</dt>
                  <dd className="mt-1 text-ink">
                    {item.date_of_event ? new Date(item.date_of_event).toLocaleDateString() : "_"}
                  </dd>
                </div>
                {item.serial_number && (
                  <div>
                    <dt className="font-semibold text-ink-faint uppercase tracking-wider text-xs">Serial Number</dt>
                    <dd className="mt-1 font-mono text-ink">{item.serial_number}</dd>
                  </div>
                )}
              </dl>

              <div className="divider" />

              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-ink-faint">Description</h3>
                <p className="mt-2 text-ink-muted whitespace-pre-wrap leading-relaxed">{item.description ?? "_"}</p>
              </div>
            </div>

            <div className="card p-6">
              <h2 className="text-lg font-bold text-ink">Sightings</h2>
              {sightings.length > 0 ? (
                <ul className="mt-4 space-y-3" role="list">
                  {sightings.map((s) => (
                    <li key={s.id} className="rounded-lg bg-cream-100 border border-cream-300 p-4">
                      <p className="text-sm text-ink-muted">{s.description ?? "_"}</p>
                      <div className="mt-2 flex gap-4 text-xs text-ink-faint">
                        {s.location_id && <span>Location: {s.location_id}</span>}
                        <time dateTime={s.spotted_at}>
                          Spotted: {s.spotted_at ? new Date(s.spotted_at).toLocaleString() : "_"}
                        </time>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-3 text-sm text-ink-faint">No sightings reported yet.</p>
              )}

              <div className="divider" />

              <h3 className="text-base font-bold text-ink">Submit a Sighting</h3>
              <p className="text-xs text-ink-faint mt-1">No account needed to report a sighting.</p>
              <SightingForm itemId={item.id} />
            </div>

            {matches.length > 0 && (
              <section>
                <h2 className="text-lg font-bold text-ink mb-4">Potential Matches</h2>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {matches.map((m) => (
                    <ItemCard key={m.id} {...m} />
                  ))}
                </div>
              </section>
            )}
          </div>

          <aside className="space-y-6">
            <div className="card p-6">
              <h2 className="text-lg font-bold text-ink">Status Timeline</h2>
              <div className="mt-4">
                <Timeline events={timelineEvents} />
              </div>
            </div>

            <ClaimButton itemId={item.id} itemStatus={item.status} />
          </aside>
        </div>
      </div>
    </div>
  );
}
