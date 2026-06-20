"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { api } from "@/lib/api";
import { connectSocket, disconnectSocket } from "@/lib/socket";

interface MessageItem {
  id: string;
  content: string;
  sender: { id: string; name: string };
  is_read: boolean;
  created_at: string;
}

interface ConversationDetail {
  id: string;
  item_report: { id: string; title: string; image_url?: string };
  other_user: { id: string; name: string };
  updated_at: string;
}

export default function ConversationPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const conversationId = params.id as string;

  const [conversation, setConversation] = useState<ConversationDetail | null>(null);
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [fetching, setFetching] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth/login");
      return;
    }
    if (!user || !conversationId) return;

    Promise.all([
      api.get<ConversationDetail[]>("/chat/conversations").then((convs) =>
        convs.find((c) => c.id === conversationId) ?? null
      ),
      api.get<MessageItem[]>(`/chat/conversations/${conversationId}/messages`),
    ])
      .then(([conv, msgs]) => {
        setConversation(conv);
        setMessages(msgs);
      })
      .catch(() => router.push("/chat"))
      .finally(() => setFetching(false));
  }, [user, loading, conversationId, router]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  useEffect(() => {
    if (!user || !conversationId) return;

    const socket = connectSocket();
    socket.emit("join_conversation", { conversationId });

    socket.on("new_message", (msg: MessageItem) => {
      setMessages((prev) => {
        if (prev.some((m) => m.id === msg.id)) return prev;
        return [...prev, msg];
      });
    });

    return () => {
      socket.emit("leave_conversation", { conversationId });
      socket.off("new_message");
      disconnectSocket();
    };
  }, [user, conversationId]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    const content = newMessage.trim();
    if (!content || sending) return;

    setSending(true);

    try {
      const msg = await api.post<MessageItem>(
        `/chat/conversations/${conversationId}/messages`,
        { content }
      );
      setNewMessage("");
      setMessages((prev) => {
        if (prev.some((m) => m.id === msg.id)) return prev;
        return [...prev, msg];
      });
    } catch {
      // keep message in input on failure
    } finally {
      setSending(false);
      inputRef.current?.focus();
    }
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const formatDateSeparator = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    if (date.toDateString() === today.toDateString()) return "Today";
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    if (date.toDateString() === yesterday.toDateString()) return "Yesterday";
    return date.toLocaleDateString(undefined, { weekday: "long", month: "short", day: "numeric" });
  };

  if (loading || fetching || !user) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-transparent" />
      </div>
    );
  }

  // Group messages by date
  const groupedMessages: { date: string; messages: MessageItem[] }[] = [];
  messages.forEach((msg) => {
    const dateKey = new Date(msg.created_at).toDateString();
    const lastGroup = groupedMessages[groupedMessages.length - 1];
    if (lastGroup && lastGroup.date === dateKey) {
      lastGroup.messages.push(msg);
    } else {
      groupedMessages.push({ date: dateKey, messages: [msg] });
    }
  });

  const otherName = conversation?.other_user?.name ?? "?";
  const otherInitial = otherName.charAt(0).toUpperCase();

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-border px-4 py-3">
        <Link
          href="/chat"
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-colors hover:bg-bg-hover sm:hidden"
          aria-label="Back to chats"
        >
          <svg className="h-5 w-5 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent/15 text-xs font-bold text-accent">
          {otherInitial}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-text">{otherName}</p>
          {conversation?.item_report && (
            <p className="truncate text-[11px] text-text-muted">
              Re: {conversation.item_report.title ?? "_"}
            </p>
          )}
        </div>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto px-1 py-4">
        {groupedMessages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-3">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-accent/10">
              <svg className="h-8 w-8 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <p className="text-xs text-text-muted">No messages yet</p>
            <p className="text-xs text-text-ghost">Send a message to start the conversation</p>
          </div>
        ) : (
          groupedMessages.map((group) => (
            <div key={group.date}>
              {/* Date separator */}
              <div className="my-5 flex items-center gap-3">
                <div className="flex-1 border-t border-border" />
                <span className="rounded-full bg-bg-elevated px-3 py-1 text-[10px] font-medium text-text-ghost">
                  {formatDateSeparator(group.messages[0].created_at)}
                </span>
                <div className="flex-1 border-t border-border" />
              </div>

              {group.messages.map((msg, idx) => {
                const isMe = msg.sender?.id === user.id;
                const prevMsg = idx > 0 ? group.messages[idx - 1] : null;
                const sameSenderAsPrev = prevMsg?.sender?.id === msg.sender?.id;
                const timeDiff = prevMsg
                  ? (new Date(msg.created_at).getTime() - new Date(prevMsg.created_at).getTime()) / 60000
                  : Infinity;
                const isGrouped = sameSenderAsPrev && timeDiff < 3;

                return (
                  <div
                    key={msg.id}
                    className={`flex ${isMe ? "justify-end" : "justify-start"} ${isGrouped ? "mt-0.5" : "mt-3"}`}
                  >
                    {/* Avatar for other user (first in group only) */}
                    {!isMe && !isGrouped && (
                      <div className="mr-2 mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent/15 text-[10px] font-bold text-accent">
                        {(msg.sender?.name ?? "?").charAt(0).toUpperCase()}
                      </div>
                    )}
                    {!isMe && isGrouped && <div className="mr-2 w-7 shrink-0" />}

                    <div
                      className={`max-w-[75%] px-3.5 py-2 ${
                        isMe
                          ? isGrouped
                            ? "rounded-2xl rounded-r-lg bg-accent text-bg"
                            : "rounded-2xl rounded-br-lg bg-accent text-bg"
                          : isGrouped
                          ? "rounded-2xl rounded-l-lg border border-border-light bg-bg-card text-text"
                          : "rounded-2xl rounded-bl-lg border border-border-light bg-bg-card text-text"
                      }`}
                    >
                      {!isMe && !isGrouped && (
                        <p className="mb-0.5 text-[11px] font-semibold text-accent">
                          {msg.sender?.name ?? "_"}
                        </p>
                      )}
                      <p className="text-[13px] leading-relaxed whitespace-pre-wrap break-words">
                        {msg.content}
                      </p>
                      {/* Only show time on last message in group or if not grouped */}
                      {(!isGrouped || idx === group.messages.length - 1 ||
                        group.messages[idx + 1]?.sender?.id !== msg.sender?.id) && (
                        <p
                          className={`mt-0.5 text-right text-[9px] ${
                            isMe ? "opacity-50" : "text-text-ghost"
                          }`}
                        >
                          {formatTime(msg.created_at)}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="flex items-center gap-3 border-t border-border px-4 py-3">
        <input
          ref={inputRef}
          type="text"
          placeholder={`Message ${otherName}...`}
          className="flex-1 rounded-xl border border-border bg-bg-elevated px-4 py-2.5 text-sm text-text placeholder:text-text-ghost outline-none transition-all focus:border-accent/40"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          disabled={sending}
        />
        <button
          type="submit"
          disabled={!newMessage.trim() || sending}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent-dark text-white transition-all hover:opacity-80 disabled:opacity-30 disabled:cursor-not-allowed"
        >
          {sending ? (
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
          ) : (
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
            </svg>
          )}
        </button>
      </form>
    </div>
  );
}
