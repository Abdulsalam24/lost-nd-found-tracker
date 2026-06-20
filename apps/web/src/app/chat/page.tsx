"use client";

import { Suspense } from "react";
import { ChatList } from "@/features/chat/ChatList";

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
