import Link from "next/link";
import { GameCard } from "@/components/games/GameCard";
import { serverFetch } from "@/lib/api";

interface LeaderboardEntry {
  user_id: string;
  name: string | null;
  total_points: number;
}

async function getTriviaLeaderboard(): Promise<LeaderboardEntry[]> {
  try {
    return await serverFetch<LeaderboardEntry[]>("/games/trivia/leaderboard");
  } catch {
    return [];
  }
}

export default async function GamesPage() {
  const leaderboard = await getTriviaLeaderboard();

  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-5xl px-4 py-8">
        <h1 className="section-title">Campus Games</h1>
        <p className="section-subtitle">
          Have fun while helping the campus community. Earn points and badges!
        </p>

        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <GameCard
            title="Detective Game"
            description="Guess the weekly faculty ranking for lost items. Drag and drop to rank, then see how close you were!"
            href="/games/detective"
            color="bg-cream-200"
            icon={
              <svg className="h-16 w-16 text-coral" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            }
          />

          <GameCard
            title="Ghost Hunt"
            description="Find the hidden item on campus using weekly clues. First to crack the secret code wins!"
            href="/games/ghost-hunt"
            color="bg-cream-200"
            icon={
              <svg className="h-16 w-16 text-coral" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            }
          />

          <GameCard
            title="Trivia Challenge"
            description="Test your knowledge about campus lost and found trends. Answer questions and climb the leaderboard!"
            href="/games/trivia"
            color="bg-cream-200"
            icon={
              <svg className="h-16 w-16 text-coral" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            }
          />
        </div>

        {/* Trivia Leaderboard */}
        {leaderboard.length > 0 && (
          <div className="mt-12">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-text">Trivia Leaderboard</h2>
                <p className="mt-1 text-xs text-text-muted">Top players across all trivia challenges</p>
              </div>
              <Link href="/games/trivia" className="text-xs font-medium text-accent hover:underline">
                Play now
              </Link>
            </div>

            {/* Champion */}
            {leaderboard[0] && (
              <div className="mt-4 card overflow-hidden border border-yellow-500/20">
                <div className="bg-gradient-to-r from-yellow-500/10 via-yellow-500/5 to-transparent px-5 py-4">
                  <div className="flex items-center gap-4">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-yellow-500/15 text-3xl">
                      👑
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] font-semibold uppercase tracking-widest text-yellow-500/70">Current Champion</p>
                      <p className="mt-0.5 text-lg font-bold text-text truncate">
                        {leaderboard[0].name || leaderboard[0].user_id.slice(0, 8)}
                      </p>
                      {!leaderboard[0].name && (
                        <p className="text-[10px] text-text-ghost">Anonymous player</p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-yellow-400">{leaderboard[0].total_points}</p>
                      <p className="text-[10px] text-text-muted">points</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Rest */}
            {leaderboard.length > 1 && (
              <div className="mt-3 space-y-2">
                {leaderboard.slice(1, 10).map((entry, i) => {
                  const rank = i + 2;
                  const displayName = entry.name || entry.user_id.slice(0, 8);

                  return (
                    <div
                      key={entry.user_id}
                      className={`card flex items-center gap-4 p-4 ${rank <= 3 ? "border border-border-light" : ""}`}
                    >
                      {rank === 2 ? (
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center text-xl">🥈</span>
                      ) : rank === 3 ? (
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center text-xl">🥉</span>
                      ) : (
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-bg-elevated text-xs font-bold text-text-muted">
                          {rank}
                        </span>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className={`font-semibold truncate ${rank <= 3 ? "text-text" : "text-text-secondary"}`}>
                          {displayName}
                        </p>
                        {!entry.name && (
                          <p className="text-[10px] text-text-ghost">Anonymous player</p>
                        )}
                      </div>
                      <span className={`text-xs font-bold ${rank <= 3 ? "text-accent" : "text-text-muted"}`}>
                        {entry.total_points} pts
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        <div className="mt-8 text-center">
          <Link href="/games/hall-of-fame" className="text-xs font-semibold text-accent hover:underline">
            View Hall of Fame &rarr;
          </Link>
        </div>
      </div>
    </div>
  );
}
