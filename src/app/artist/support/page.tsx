import type { ArtistSupportMessageRecord } from "@/lib/artist-support";
import { getArtistSupportProviderConversationId } from "@/lib/artist-support";
import { requirePaidArtist } from "@/lib/permissions";
import { createServiceSupabaseClient } from "@/lib/supabase/server";
import { SupportChat } from "./support-chat";

export const dynamic = "force-dynamic";

export default async function ArtistSupportPage() {
  const { user } = await requirePaidArtist();
  const supabase = createServiceSupabaseClient();
  const providerConversationId = getArtistSupportProviderConversationId(user.id);
  let messages: ArtistSupportMessageRecord[] = [];

  if (supabase) {
    const { data: conversation } = await supabase
      .from("sendpulse_conversations")
      .select("id")
      .eq("provider_conversation_id", providerConversationId)
      .maybeSingle();

    if (conversation?.id) {
      const { data } = await supabase
        .from("sendpulse_messages")
        .select("id,direction,message_type,body,raw_payload,occurred_at")
        .eq("conversation_id", conversation.id)
        .order("occurred_at", { ascending: true })
        .limit(80);

      messages = (data ?? []) as ArtistSupportMessageRecord[];
    }
  }

  return <SupportChat initialMessages={messages} />;
}
