import { serverFetch } from "@/lib/api";
import { EmptyState } from "@/components/EmptyState";

interface FacultyEntry {
  faculty: string;
  count: number;
}

async function getLeaderboard(): Promise<FacultyEntry[]> {
  try {
    return await serverFetch<FacultyEntry[]>("/leaderboard/faculties");
  } catch {
    return [];
  }
}

export default async function LeaderboardPage() {
  const data = await getLeaderboard();
  const maxCount = Math.max(...data.map((d) => d.count), 1);

  return (
    <div className="min-h-screen bg-cream">
      <div className="mx-auto max-w-4xl px-4 py-8">
        <h1 className="section-title">Faculty Leaderboard</h1>
        <p className="section-subtitle">
          Faculties ranked by number of lost items reported.
        </p>

        {data.length > 0 ? (
          <div className="mt-6 card overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="table-header">
                  <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-ink-faint uppercase tracking-wider">Rank</th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-ink-faint uppercase tracking-wider">Faculty</th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-ink-faint uppercase tracking-wider">Lost Items</th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-ink-faint uppercase tracking-wider sr-only sm:not-sr-only">Distribution</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cream-200">
                {data.map((entry, idx) => (
                  <tr key={entry.faculty} className="table-row">
                    <td className="px-4 py-3">
                      <span className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
                        idx === 0 ? "bg-coral text-cream" : idx === 1 ? "bg-kraft text-cream" : idx === 2 ? "bg-cream-200 text-coral" : "bg-cream-100 text-ink-faint"
                      }`}>
                        {idx + 1}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-ink">{entry.faculty ?? "_"}</td>
                    <td className="px-4 py-3 text-sm font-bold text-coral">{entry.count ?? "_"}</td>
                    <td className="hidden px-4 py-3 sm:table-cell">
                      <div className="h-2 w-full max-w-[200px] rounded-full bg-cream-200">
                        <div
                          className="h-2 rounded-full bg-coral"
                          style={{ width: `${(entry.count / maxCount) * 100}%` }}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState title="No data yet" message="The leaderboard will update as items are reported." />
        )}
      </div>
    </div>
  );
}
