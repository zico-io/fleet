import { ChatSidePanel } from "@/components/chat-sidepanel";
import { MobileNav, Sidebar } from "../nav";

// Shell for the authenticated app: floating sidebar + content surface + chat
// panel. Login and the OAuth callback live outside this group so they render
// bare (the root layout only provides <html>/<body>). Middleware gates access.
export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-dvh flex-col gap-2 p-2 lg:flex-row lg:gap-3 lg:p-3">
      <Sidebar />
      <main className="surface min-h-0 min-w-0 flex-1 overflow-hidden">
        <div className="h-full overflow-y-auto">{children}</div>
      </main>
      <ChatSidePanel />
      <MobileNav />
    </div>
  );
}
