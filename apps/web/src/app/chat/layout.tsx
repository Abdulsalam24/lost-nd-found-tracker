"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { api } from "@/lib/api";

interface ConversationPreview {
  id: string;
  item_report: { id: string; title: string } | null;
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
  }, [user, pathname]);

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
    <div className="mx-auto max-w-6xl px-4 py-6" style={{ height: "calc(100vh - 80px)" }}>
      <div className="flex h-full overflow-hidden rounded-2xl border border-border bg-bg-card">
        {/* Sidebar */}
        <aside className={`w-full shrink-0 border-r border-border sm:w-80 lg:w-96 flex flex-col ${isConversationOpen ? "hidden sm:flex" : "flex"}`}>
          <div className="shrink-0 px-5 py-4 border-b border-border">
            <h1 className="font-heading text-lg font-bold text-text">Messages</h1>
            <p className="text-xs text-text-muted mt-0.5">{conversations.length} conversation{conversations.length !== 1 ? "s" : ""}</p>
          </div>

          <div className="flex-1 overflow-y-auto">
            {fetching ? (
              <div className="space-y-1 p-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-3 rounded-xl p-3 animate-pulse">
                    <div className="h-11 w-11 shrink-0 rounded-full bg-bg-elevated" />
                    <div className="flex-1 space-y-2">
                      <div className="h-3.5 w-1/2 rounded bg-bg-elevated" />
                      <div className="h-3 w-3/4 rounded bg-bg-elevated" />
                    </div>
                  </div>
                ))}
              </div>
            ) : conversations.length === 0 ? (
              <div className="px-5 py-16 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-bg-elevated">
                  <svg className="h-7 w-7 text-text-ghost" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <p className="mt-3 text-sm font-medium text-text-muted">No conversations yet</p>
                <p className="mt-1 text-xs text-text-ghost">Start one from any item page</p>
              </div>
            ) : (
              <div className="p-2">
                {conversations.map((conv) => {
                  const active = pathname === `/chat/${conv.id}`;
                  const hasUnread = conv.unread_count > 0;
                  return (
                    <Link
                      key={conv.id}
                      href={`/chat/${conv.id}`}
                      className={`flex items-center gap-3 rounded-xl px-3 py-3.5 transition-colors ${
                        active
                          ? "bg-accent/10"
                          : "hover:bg-bg-hover"
                      }`}
                    >
                      <div className="relative">
                        <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                          active ? "bg-accent text-white" : "bg-accent/15 text-accent"
                        }`}>
                          {(conv.other_user?.name ?? "?").charAt(0).toUpperCase()}
                        </div>
                        {hasUnread && (
                          <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-bold text-white">
                            {conv.unread_count}
                          </span>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <p className={`truncate text-sm ${hasUnread ? "font-bold text-text" : "font-semibold text-text"}`}>
                            {conv.other_user?.name ?? "_"}
                          </p>
                          {conv.last_message && (
                            <span className="shrink-0 text-[10px] text-text-ghost">
                              {formatTime(conv.last_message.created_at)}
                            </span>
                          )}
                        </div>
                        {conv.item_report && (
                          <p className="truncate text-[10px] text-accent/70">
                            Re: {conv.item_report.title}
                          </p>
                        )}
                        {conv.last_message && (
                          <p className={`mt-0.5 truncate text-xs ${hasUnread ? "font-medium text-text-secondary" : "text-text-muted"}`}>
                            {conv.last_message.sender_id === user.id ? "You: " : ""}
                            {conv.last_message.content}
                          </p>
                        )}
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </aside>

        {/* Main content */}
        <main className={`flex-1 flex flex-col bg-bg ${!isConversationOpen ? "hidden sm:flex" : "flex"}`}>
          {!isConversationOpen ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-bg-elevated">
                  <svg className="h-10 w-10 text-text-ghost" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <p className="mt-4 text-base font-semibold text-text">Select a conversation</p>
                <p className="mt-1 text-sm text-text-muted">Pick someone from the left to start chatting</p>
              </div>
            </div>
          ) : (
            children
          )}
        </main>
      </div>
    </div>
  );
}
