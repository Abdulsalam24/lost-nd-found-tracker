"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { api } from "@/lib/api";

interface ConversationPreview {
  id: string;
  item_report: { id: string; title: string };
  other_user: { id: string; name: string };
  last_message: { content: string; created_at: string; sender_id: string } | null;
  unread_count: number;
  updated_at: string;
}

export default function ChatLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const pathname = usePathname();
  const [conversations, setConversations] = useState<ConversationPreview[]>([]);
  const [fetching, setFetching] = useState(true);
  const isConversationOpen = pathname !== "/chat";

  useEffect(() => {
    if (!user) return;
    api.get<ConversationPreview[]>("/chat/conversations")
      .then(setConversations)
      .catch(() => {})
      .finally(() => setFetching(false));
  }, [user]);

  if (loading || !user) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-transparent" />
      </div>
    );
  }

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "Now";
    if (mins < 60) return `${mins}m`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h`;
    return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  };

  return (
    <div className="mx-auto flex max-w-6xl" style={{ height: "calc(100vh - 80px)" }}>
      {/* Sidebar — conversations list */}
      <aside className={`w-full shrink-0 border-r border-border overflow-y-auto sm:w-80 lg:w-96 ${isConversationOpen ? "hidden sm:block" : ""}`}>
        <div className="sticky top-0 z-10 border-b border-border bg-bg/80 px-5 py-4 backdrop-blur-xl">
          <h1 className="font-heading text-xl font-bold text-text">Messages</h1>
        </div>

        {fetching ? (
          <div className="space-y-1 p-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 rounded-xl p-3 animate-pulse">
                <div className="h-10 w-10 shrink-0 rounded-full bg-bg-elevated" />
                <div className="flex-1 space-y-2">
                  <div className="h-3.5 w-1/2 rounded bg-bg-elevated" />
                  <div className="h-3 w-3/4 rounded bg-bg-elevated" />
                </div>
              </div>
            ))}
          </div>
        ) : conversations.length === 0 ? (
          <div className="px-5 py-12 text-center">
            <p className="text-sm text-text-muted">No conversations yet</p>
            <p className="mt-1 text-xs text-text-ghost">Start one from any item page</p>
          </div>
        ) : (
          <div className="p-2">
            {conversations.map((conv) => {
              const active = pathname === `/chat/${conv.id}`;
              return (
                <Link
                  key={conv.id}
                  href={`/chat/${conv.id}`}
                  className={`flex items-center gap-3 rounded-xl px-3 py-3 transition-colors ${
                    active ? "bg-bg-elevated" : "hover:bg-bg-hover"
                  }`}
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent/15 text-xs font-bold text-accent">
                    {(conv.other_user?.name ?? "?").charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <p className="truncate text-sm font-semibold text-text">
                        {conv.other_user?.name ?? "_"}
                      </p>
                      {conv.last_message && (
                        <span className="shrink-0 text-[10px] text-text-ghost">
                          {formatTime(conv.last_message.created_at)}
                        </span>
                      )}
                    </div>
                    {conv.last_message && (
                      <p className="mt-0.5 truncate text-xs text-text-muted">
                        {conv.last_message.sender_id === user.id ? "You: " : ""}
                        {conv.last_message.content}
                      </p>
                    )}
                  </div>
                  {conv.unread_count > 0 && (
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent text-[10px] font-bold text-white">
                      {conv.unread_count}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        )}
      </aside>

      {/* Main content — conversation or empty state */}
      <main className={`flex-1 ${!isConversationOpen ? "hidden sm:flex sm:items-center sm:justify-center" : ""}`}>
        {!isConversationOpen ? (
          <div className="text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-bg-elevated">
              <svg className="h-8 w-8 text-text-ghost" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <p className="mt-4 text-sm text-text-muted">Select a conversation</p>
          </div>
        ) : (
          children
        )}
      </main>
    </div>
  );
}
