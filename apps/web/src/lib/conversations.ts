import { createClient } from "@/lib/supabase/client";

// Browser-side reads/writes for conversations and their messages. RLS scopes
// everything to the signed-in user. Assistant + user message rows are written
// server-side in /api/agent; the client only lists, creates, and reads.

export type Conversation = { id: string; title: string | null; updated_at: string };
export type DbMessage = { id: string; role: "user" | "assistant"; content: string };

export async function listConversations(): Promise<Conversation[]> {
  const supabase = createClient();
  const { data } = await supabase
    .from("conversations")
    .select("id, title, updated_at")
    .order("updated_at", { ascending: false });
  return data ?? [];
}

export async function createConversation(): Promise<string> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("not signed in");
  const { data, error } = await supabase
    .from("conversations")
    .insert({ user_id: user.id })
    .select("id")
    .single();
  if (error) throw error;
  return data.id;
}

export async function loadMessages(conversationId: string): Promise<DbMessage[]> {
  const supabase = createClient();
  const { data } = await supabase
    .from("messages")
    .select("id, role, content")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true });
  return (data as DbMessage[] | null) ?? [];
}
