"use client";

interface LeaderboardEntry {
  user_id: string;
  name: string | null;
  total_points: number;
}

export function TriviaLeaderboard({ entries }: { entries: LeaderboardEntry[] }) {
  const champion = entries[0];
  const rest = entries.slice(1);

  return (
    <div className="mt-8">
      <h2 className="text-lg font-bold text-text">Leaderboard</h2>
      <p className="mt-1 text-xs text-text-muted">All players who took the trivia challenge</p>

      {champion && (
        <div className="mt-4 card overflow-hidden border border-yellow-500/20">
          <div className="bg-gradient-to-r from-yellow-500/10 via-yellow-500/5 to-transparent px-5 py-4">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-yellow-500/15 text-3xl">
                👑
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-yellow-500/70">Current Champion</p>
                <p className="mt-0.5 text-lg font-bold text-text truncate">
                  {champion.name || champion.user_id.slice(0, 8)}
                </p>
                {!champion.name && (
                  <p className="text-[10px] text-text-ghost">Anonymous player</p>
                )}
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-yellow-400">{champion.total_points}</p>
                <p className="text-[10px] text-text-muted">points</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {rest.length > 0 && (
        <div className="mt-3 space-y-2">
          {rest.map((entry, i) => {
            const rank = i + 2;
            const displayName = entry.name || entry.user_id.slice(0, 8);

            return (
              <div
                key={entry.user_id}
                className={`card flex items-center gap-4 p-4 ${
                  rank <= 3 ? "border border-border-light" : ""
                }`}
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
  );
}
