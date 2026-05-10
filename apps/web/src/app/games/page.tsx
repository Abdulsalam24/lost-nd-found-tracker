import Link from "next/link";
import { GameCard } from "@/components/GameCard";

export default function GamesPage() {
  return (
    <div className="min-h-screen bg-cream">
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

        <div className="mt-8 text-center">
          <Link href="/games/hall-of-fame" className="text-sm font-semibold text-coral hover:text-coral-dark">
            View Hall of Fame &rarr;
          </Link>
        </div>
      </div>
    </div>
  );
}
