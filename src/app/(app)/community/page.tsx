import { createServerClient } from "@/lib/supabase/server"
import { CommunityChat } from "@/components/community/community-chat"
import { cookies } from "next/headers"
import type { Message } from "@/types/community"

export default async function CommunityPage() {
  const cookieStore = cookies()
  const supabase = await createServerClient(cookieStore)

  // First fetch messages
  const { data: messages, error: messagesError } = await supabase
    .from('messages')
    .select('*')
    .eq('channel_id', '1') // general channel
    .order('created_at', { ascending: false }) // Get most recent first
    .limit(20)

  if (messagesError) {
    console.error('Error fetching messages:', messagesError)
    return (
      <div className="h-full w-full p-0">
        <CommunityChat initialMessages={[]} />
      </div>
    )
  }

  console.log('Server fetched messages:', messages)

  // Get unique user IDs
  const userIds = [...new Set(messages?.map(msg => msg.user_id) || [])]

  // Fetch user metadata for all users
  const userMetadataPromises = userIds.map(async (userId) => {
    const { data: metadata, error } = await supabase.rpc('get_user_metadata', { user_id: userId })
    if (error) {
      console.error(`Error fetching user ${userId}:`, error)
      return null
    }
    return {
      id: userId,
      metadata: metadata || {}
    }
  })

  const userMetadataResults = await Promise.all(userMetadataPromises)
  const userMetadataMap = new Map(
    userMetadataResults
      .filter((result): result is NonNullable<typeof result> => result !== null)
      .map(result => [result.id, result.metadata])
  )

  // Transform the data to match our Message type and reverse the order back to ascending
  const transformedMessages: Message[] = messages
    ?.reverse() // Reverse back to ascending order for display
    .map(msg => {
      const metadata = userMetadataMap.get(msg.user_id) || {}
      const fullName = metadata.full_name || 
                      metadata.name || 
                      metadata.email?.split('@')[0] || 
                      'Anonymous'

      return {
        id: msg.id,
        content: msg.content,
        created_at: msg.created_at,
        user_id: msg.user_id,
        attachments: msg.attachments || [],
        profiles: {
          full_name: fullName,
          avatar_url: metadata.avatar_url || '/placeholder.svg'
        }
      }
    }) || []

  return (
    <div className="h-full w-full p-0">
      <CommunityChat initialMessages={transformedMessages} />
    </div>
  )
} 