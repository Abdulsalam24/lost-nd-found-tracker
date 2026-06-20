import Link from "next/link";
import { serverFetch } from "@/lib/api";

interface LeaderboardEntry {
  user_id: string;
  name: string | null;
  total_points: number;
}

const GAMES = [
  { title: "Detective Game", description: "Guess the weekly faculty ranking for lost items. Drag and drop to rank, then see how close you were!", href: "/games/detective", emoji: "🔍", color: "emerald" as const },
  { title: "Ghost Hunt", description: "Find the hidden item on campus using weekly clues. First to crack the secret code wins!", href: "/games/ghost-hunt", emoji: "👻", color: "amber" as const },
  { title: "Trivia Challenge", description: "Test your knowledge about campus lost and found trends. Answer questions and climb the leaderboard!", href: "/games/trivia", emoji: "🧠", color: "purple" as const },
];

const COLORS = {
  emerald: { border: "border-emerald-500/20 hover:border-emerald-500/40", glow: "group-hover:shadow-emerald-500/10", tag: "bg-emerald-500/10 text-emerald-400" },
  amber: { border: "border-amber-500/20 hover:border-amber-500/40", glow: "group-hover:shadow-amber-500/10", tag: "bg-amber-500/10 text-amber-400" },
  purple: { border: "border-purple-500/20 hover:border-purple-500/40", glow: "group-hover:shadow-purple-500/10", tag: "bg-purple-500/10 text-purple-400" },
};

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
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        <h1 className="text-3xl font-bold tracking-tight text-text sm:text-4xl">Campus Games</h1>
        <p className="mt-2 text-sm text-text-secondary">
          Have fun while helping the campus community. Earn points and badges!
        </p>

        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {GAMES.map((game) => {
            const c = COLORS[game.color];
            return (
              <Link
                key={game.href}
                href={game.href}
                className={`group card flex flex-col p-5 transition-all hover:shadow-lg sm:p-6 ${c.border} ${c.glow}`}
              >
                <span className="text-4xl">{game.emoji}</span>
                <h3 className="mt-4 text-base font-semibold text-text">{game.title}</h3>
                <p className="mt-1.5 flex-1 text-xs text-text-muted leading-relaxed">{game.description}</p>
                <div className="mt-4">
                  <span className={`inline-block rounded-full px-3 py-1 text-[10px] font-semibold ${c.tag}`}>
                    Play Now &rarr;
                  </span>
                </div>
              </Link>
            );
          })}
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
