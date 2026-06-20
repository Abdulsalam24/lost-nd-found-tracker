import { serverFetch } from "@/lib/api";
import { EmptyState } from "@/components/ui/EmptyState";

interface FacultyEntry {
  faculty: string;
  total_reports: number;
  total_recoveries: number;
  score: number;
}

async function getLeaderboard(): Promise<FacultyEntry[]> {
  try {
    return await serverFetch<FacultyEntry[]>("/leaderboard");
  } catch {
    return [];
  }
}

export default async function LeaderboardPage() {
  const data = await getLeaderboard();
  const maxScore = Math.max(...data.map((d) => d.score), 1);

  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-4xl px-4 py-8">
        <h1 className="section-title">Faculty Leaderboard</h1>
        <p className="section-subtitle">
          Faculties ranked by reports and recoveries.
        </p>

        {data.length > 0 ? (
          <div className="mt-6 card overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="table-header">
                  <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-text-ghost uppercase tracking-wider">Rank</th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-text-ghost uppercase tracking-wider">Faculty</th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-text-ghost uppercase tracking-wider">Reports</th>
                  <th scope="col" className="hidden px-4 py-3 text-left text-xs font-semibold text-text-ghost uppercase tracking-wider sm:table-cell">Recovered</th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-text-ghost uppercase tracking-wider">Score</th>
                  <th scope="col" className="hidden px-4 py-3 text-left text-xs font-semibold text-text-ghost uppercase tracking-wider sm:table-cell"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {data.map((entry, idx) => (
                  <tr key={entry.faculty} className="transition-colors hover:bg-bg-hover">
                    <td className="px-4 py-3">
                      <span className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
                        idx === 0 ? "bg-yellow-500/15 text-yellow-400" : idx === 1 ? "bg-gray-400/15 text-gray-400" : idx === 2 ? "bg-orange-500/15 text-orange-400" : "bg-bg-elevated text-text-muted"
                      }`}>
                        {idx + 1}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs font-medium text-text">{entry.faculty ?? "_"}</td>
                    <td className="px-4 py-3 text-xs text-text-secondary">{entry.total_reports ?? "_"}</td>
                    <td className="hidden px-4 py-3 text-xs text-emerald-400 sm:table-cell">{entry.total_recoveries ?? "_"}</td>
                    <td className="px-4 py-3 text-xs font-bold text-accent">{entry.score ?? "_"}</td>
                    <td className="hidden px-4 py-3 sm:table-cell">
                      <div className="h-2 w-full max-w-[200px] rounded-full bg-bg-elevated">
                        <div
                          className="h-2 rounded-full bg-accent"
                          style={{ width: `${(entry.score / maxScore) * 100}%` }}
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
