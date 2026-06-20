import { serverFetch } from "@/lib/api";
import { EmptyState } from "@/components/EmptyState";

interface LeaderboardEntry {
  user_name: string;
  points: number;
  rank: number;
  badges: string[];
}

async function getDetectiveLeaderboard(): Promise<LeaderboardEntry[]> {
  try {
    return await serverFetch<LeaderboardEntry[]>("/games/detective/leaderboard");
  } catch {
    return [];
  }
}

async function getTriviaLeaderboard(): Promise<LeaderboardEntry[]> {
  try {
    return await serverFetch<LeaderboardEntry[]>("/games/trivia/leaderboard/all-time");
  } catch {
    return [];
  }
}

const BADGE_LABELS: Record<string, string> = {
  FIRST_RETURN: "First Return",
  GHOST_HUNTER: "Ghost Hunter",
  TRIVIA_CHAMP: "Trivia Champ",
  SERIAL_FINDER: "Serial Finder",
  CAMPUS_HERO: "Campus Hero",
};

export default async function HallOfFamePage() {
  const [detective, trivia] = await Promise.all([
    getDetectiveLeaderboard(),
    getTriviaLeaderboard(),
  ]);

  return (
    <div className="min-h-screen bg-cream">
      <div className="mx-auto max-w-5xl px-4 py-8">
        <h1 className="section-title">Hall of Fame</h1>
        <p className="section-subtitle">All-time top players and badge holders.</p>

        <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-2">
          <div>
            <h2 className="flex items-center gap-2 text-lg font-bold text-ink">
              <svg className="h-5 w-5 text-coral" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
              </svg>
              Top Detectives
            </h2>
            {detective.length > 0 ? (
              <div className="mt-4 card overflow-hidden">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="table-header">
                      <th scope="col" className="px-4 py-2 text-left font-semibold text-ink-faint">#</th>
                      <th scope="col" className="px-4 py-2 text-left font-semibold text-ink-faint">Player</th>
                      <th scope="col" className="px-4 py-2 text-right font-semibold text-ink-faint">Points</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-cream-200">
                    {detective.map((entry) => (
                      <tr key={entry.rank} className="table-row">
                        <td className="px-4 py-2">
                          <span className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
                            entry.rank === 1 ? "bg-coral text-cream" : "bg-cream-200 text-ink-muted"
                          }`}>
                            {entry.rank}
                          </span>
                        </td>
                        <td className="px-4 py-2 font-medium text-ink">{entry.user_name ?? "_"}</td>
                        <td className="px-4 py-2 text-right font-bold text-coral">{entry.points ?? "_"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <EmptyState title="No data" message="No detective game results yet." />
            )}
          </div>

          <div>
            <h2 className="flex items-center gap-2 text-lg font-bold text-ink">
              <svg className="h-5 w-5 text-coral" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
              </svg>
              Trivia Champions
            </h2>
            {trivia.length > 0 ? (
              <div className="mt-4 card overflow-hidden">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="table-header">
                      <th scope="col" className="px-4 py-2 text-left font-semibold text-ink-faint">#</th>
                      <th scope="col" className="px-4 py-2 text-left font-semibold text-ink-faint">Player</th>
                      <th scope="col" className="px-4 py-2 text-right font-semibold text-ink-faint">Points</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-cream-200">
                    {trivia.map((entry) => (
                      <tr key={entry.rank} className="table-row">
                        <td className="px-4 py-2">
                          <span className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
                            entry.rank === 1 ? "bg-coral text-cream" : "bg-cream-200 text-ink-muted"
                          }`}>
                            {entry.rank}
                          </span>
                        </td>
                        <td className="px-4 py-2 font-medium text-ink">{entry.user_name ?? "_"}</td>
                        <td className="px-4 py-2 text-right font-bold text-coral">{entry.points ?? "_"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <EmptyState title="No data" message="No trivia results yet." />
            )}
          </div>
        </div>

        <div className="mt-10">
          <h2 className="text-lg font-bold text-ink">Badges</h2>
          <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {Object.entries(BADGE_LABELS).map(([type, label]) => (
              <div key={type} className="card card-hover flex flex-col items-center p-4 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-coral-50">
                  <svg className="h-6 w-6 text-coral" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                  </svg>
                </div>
                <p className="mt-2 text-xs font-semibold text-ink-muted">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
