export function SkeletonCard() {
  return (
    <div className="card overflow-hidden animate-pulse">
      <div className="aspect-[4/3] bg-bg-elevated" />
      <div className="p-4 space-y-3">
        <div className="flex gap-2">
          <div className="h-4 w-12 rounded-full bg-bg-elevated" />
          <div className="h-4 w-16 rounded-full bg-bg-elevated" />
        </div>
        <div className="h-4 w-3/4 rounded bg-bg-elevated" />
        <div className="h-3 w-1/2 rounded bg-bg-elevated" />
        <div className="flex justify-between">
          <div className="h-4 w-16 rounded-full bg-bg-elevated" />
          <div className="h-3 w-20 rounded bg-bg-elevated" />
        </div>
      </div>
    </div>
  );
}

export function SkeletonItemGrid({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}

export function SkeletonChatRow() {
  return (
    <div className="card flex items-center gap-4 p-4 animate-pulse">
      <div className="h-12 w-12 shrink-0 rounded-full bg-bg-elevated" />
      <div className="flex-1 space-y-2">
        <div className="h-4 w-1/3 rounded bg-bg-elevated" />
        <div className="h-3 w-1/4 rounded bg-bg-elevated" />
        <div className="h-3 w-2/3 rounded bg-bg-elevated" />
      </div>
    </div>
  );
}

export function SkeletonChatList({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonChatRow key={i} />
      ))}
    </div>
  );
}

export function SkeletonProfileForm() {
  return (
    <div className="space-y-8 animate-pulse">
      <div className="card p-6 space-y-4">
        <div className="h-5 w-40 rounded bg-bg-elevated" />
        <div className="h-px bg-border" />
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="h-3 w-20 rounded bg-bg-elevated" />
              <div className="h-11 rounded-xl bg-bg-elevated" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
