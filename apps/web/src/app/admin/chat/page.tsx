"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { EmptyState } from "@/components/ui/EmptyState";

interface Conversation {
  id: string;
  item_report: { id: string; title: string } | null;
  other_user: { id: string; name: string };
  last_message: { content: string; created_at: string; sender_id: string } | null;
  unread_count: number;
  updated_at: string;
}

export default function AdminChatListPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<Conversation[]>("/chat/conversations")
      .then(setConversations)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner />;

  if (conversations.length === 0) {
    return <EmptyState title="No conversations" message="Start a conversation from the Users page." />;
  }

  return (
    <div className="space-y-2">
      {conversations.map((conv) => {
        const initial = (conv.other_user?.name ?? "?").charAt(0).toUpperCase();
        const timeStr = conv.last_message?.created_at
          ? new Date(conv.last_message.created_at).toLocaleDateString("en", { month: "short", day: "numeric" })
          : "";

        return (
          <Link
            key={conv.id}
            href={`/admin/chat/${conv.id}`}
            className="card flex items-center gap-4 p-4 transition-colors hover:bg-bg-hover"
          >
            <div className="relative">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent/15 text-sm font-bold text-accent">
                {initial}
              </span>
              {conv.unread_count > 0 && (
                <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-accent text-[9px] font-bold text-white">
                  {conv.unread_count}
                </span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-semibold text-text truncate">{conv.other_user?.name ?? "_"}</p>
                <span className="shrink-0 text-[11px] text-text-ghost">{timeStr}</span>
              </div>
              <p className="mt-0.5 truncate text-xs text-text-muted">
                {conv.last_message?.content ?? "No messages yet"}
              </p>
              {conv.item_report && (
                <p className="mt-0.5 truncate text-[10px] text-text-ghost">
                  Re: {conv.item_report.title}
                </p>
              )}
            </div>
          </Link>
        );
      })}
    </div>
  );
}
