"use client";

import { Suspense, useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { api } from "@/lib/api";
import { SkeletonChatList } from "@/components/Skeleton";

interface ConversationPreview {
  id: string;
  item_report: { id: string; title: string };
  other_user: { id: string; name: string };
  last_message: { content: string; created_at: string; sender_id: string } | null;
  unread_count: number;
  updated_at: string;
}

function ChatList() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const itemFilter = searchParams.get("item");
  const [conversations, setConversations] = useState<ConversationPreview[]>([]);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth/login");
      return;
    }
    if (user) {
      api.get<ConversationPreview[]>("/chat/conversations")
        .then((convs) => {
          if (itemFilter) {
            setConversations(convs.filter((c) => c.item_report?.id === itemFilter));
          } else {
            setConversations(convs);
          }
        })
        .catch(() => {})
        .finally(() => setFetching(false));
    }
  }, [user, loading, router, itemFilter]);

  if (loading || !user) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-ink border-t-transparent" />
      </div>
    );
  }

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="section-title">Messages</h1>
          <p className="section-subtitle mt-1">
            {itemFilter ? "Conversations about this item" : "Conversations about items"}
          </p>
        </div>
        {itemFilter && (
          <Link
            href="/chat"
            className="text-sm font-medium text-coral hover:underline"
          >
            View all
          </Link>
        )}
      </div>

      <div className="mt-8">
        {fetching ? (
          <SkeletonChatList />
        ) : conversations.length === 0 ? (
          <div className="card p-12 text-center">
            <svg className="mx-auto h-12 w-12 text-ink-ghost" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <p className="mt-4 text-ink-muted">
              {itemFilter ? "No messages about this item yet." : "No conversations yet."}
            </p>
            <p className="mt-1 text-sm text-ink-faint">
              {itemFilter ? "You'll see messages here when someone reaches out." : "Start a conversation from any item page."}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {conversations.map((conv) => (
              <Link
                key={conv.id}
                href={`/chat/${conv.id}`}
                className="card-hover flex items-center gap-4 p-4 transition-all"
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-cream-200 text-sm font-bold text-ink">
                  {(conv.other_user?.name ?? "?").charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <p className="truncate font-semibold text-ink">
                      {conv.other_user?.name ?? "_"}
                    </p>
                    {conv.last_message && (
                      <span className="shrink-0 text-xs text-ink-faint">
                        {formatTime(conv.last_message.created_at)}
                      </span>
                    )}
                  </div>
                  <p className="mt-0.5 truncate text-xs font-medium text-coral">
                    Re: {conv.item_report?.title ?? "_"}
                  </p>
                  {conv.last_message && (
                    <p className="mt-0.5 truncate text-sm text-ink-muted">
                      {conv.last_message.sender_id === user.id ? "You: " : ""}
                      {conv.last_message.content}
                    </p>
                  )}
                </div>
                {conv.unread_count > 0 && (
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-coral text-xs font-bold text-white">
                    {conv.unread_count}
                  </span>
                )}
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function ChatListPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-ink border-t-transparent" />
        </div>
      }
    >
      <ChatList />
    </Suspense>
  );
}
