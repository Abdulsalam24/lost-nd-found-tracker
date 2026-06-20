interface TimelineEvent {
  label: string;
  date: string;
  active: boolean;
}

export function Timeline({ events }: { events: TimelineEvent[] }) {
  return (
    <ol className="relative border-l-2 border-cream-300 pl-8">
      {events.map((event, idx) => (
        <li key={idx} className="mb-8 last:mb-0">
          <div
            className={`absolute -left-[9px] h-4 w-4 rounded-full border-2 transition-shadow ${
              event.active
                ? "border-coral bg-coral shadow-[0_0_8px_rgba(201,107,85,0.4)]"
                : "border-cream-400 bg-cream-100"
            }`}
            aria-hidden="true"
          />

          <p
            className={`text-xs font-semibold ${
              event.active ? "text-coral" : "text-ink-ghost"
            }`}
          >
            {event.label ?? "_"}
          </p>
          <time className="text-xs text-ink-ghost" dateTime={event.date}>
            {event.date ? new Date(event.date).toLocaleString() : "_"}
          </time>
        </li>
      ))}
    </ol>
  );
}
