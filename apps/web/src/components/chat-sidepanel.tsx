"use client";

import { usePathname } from "next/navigation";
import { Chat } from "@/components/chat";

// Chat docked as a right-hand rail across the app. A surface sibling of <main>,
// hidden until there's room for it (lg+). Matches the left nav rail's tonal step.
// Suppressed on "/" where Chat is already the full-page view.
export function ChatSidePanel() {
  if (usePathname() === "/") return null;
  return (
    <aside className="surface hidden min-h-0 w-[28rem] shrink-0 overflow-hidden lg:block">
      <div className="h-full px-4">
        <Chat />
      </div>
    </aside>
  );
}
