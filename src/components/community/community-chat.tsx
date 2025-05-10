"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { MessageInput } from "@/components/community/message-input"
import { ChatArea } from "@/components/community/chat-area"
import { useIsMobile } from "@/hooks/use-mobile"
import { Menu } from "lucide-react"
import { cn } from "@/lib/utils"
import { createBrowserClient } from "@supabase/ssr"
import type { Channel, Message } from "@/types/community"
import { toast } from "sonner"

const channels: Channel[] = [
  {
    id: "1",
    name: "general",
    description: "General discussions about e-commerce",
  },
  {
    id: "2",
    name: "marketing",
    description: "Marketing strategies and tips",
  },
  {
    id: "3",
    name: "technical",
    description: "Technical discussions and support",
  },
]

interface CommunityChatProps {
  initialMessages?: Message[]
}

export function CommunityChat({ initialMessages = [] }: CommunityChatProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [activeChannel, setActiveChannel] = useState<Channel>(channels[0])
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isPremium, setIsPremium] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const isMobile = useIsMobile()
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setCurrentUser(user)
    }
    getUser()
  }, [supabase])

  useEffect(() => {
    const checkPremiumStatus = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: profile } = await supabase
        .from('profiles')
        .select('is_premium')
        .eq('id', user.id)
        .single()

      setIsPremium(profile?.is_premium || false)
    }

    checkPremiumStatus()
  }, [supabase])

  const fetchMessages = async () => {
    try {
      setIsLoading(true)
      console.log('Fetching messages for channel:', activeChannel?.id)
      
      // Fetch messages
      const { data: messages, error: messagesError } = await supabase
        .from('messages')
        .select('*')
        .eq('channel_id', activeChannel?.id)
        .order('created_at', { ascending: true })

      if (messagesError) throw messagesError

      // Get unique user IDs
      const userIds = [...new Set(messages?.map(msg => msg.user_id) || [])]

      // Fetch all user metadata in parallel
      const userMetadataPromises = userIds.map(userId => 
        supabase.rpc('get_user_metadata', { user_id: userId })
      )
      const userMetadataResults = await Promise.all(userMetadataPromises)
      
      // Create a map of user metadata
      const userMetadataMap = new Map(
        userMetadataResults.map((result, index) => [
          userIds[index],
          result.data || {}
        ])
      )

      // Transform messages with user data
      const messagesWithUserData = messages?.map(msg => {
        const metadata = userMetadataMap.get(msg.user_id) || {}
        return {
          id: msg.id,
          content: msg.content,
          created_at: msg.created_at,
          user_id: msg.user_id,
          attachments: msg.attachments || [],
          profiles: {
            full_name: metadata.full_name || 
                      metadata.name || 
                      metadata.email?.split('@')[0] || 
                      'Anonymous',
            avatar_url: metadata.avatar_url || '/placeholder.svg'
          }
        }
      }) || []

      setMessages(messagesWithUserData)
    } catch (error) {
      console.error('Error fetching messages:', error)
      toast.error('Failed to load messages')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (activeChannel) {
      fetchMessages()
    }
  }, [activeChannel, currentUser])

  useEffect(() => {
    if (!activeChannel) return

    const subscription = supabase
      .channel(`messages:${activeChannel.id}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `channel_id=eq.${activeChannel.id}`
      }, async (payload) => {
        const newMessage = payload.new
        if (newMessage.user_id === currentUser?.id) {
          // For current user, use their metadata
          const { data: { user } } = await supabase.auth.getUser()
          setMessages(prev => [...prev, {
            id: newMessage.id,
            content: newMessage.content,
            created_at: newMessage.created_at,
            user_id: newMessage.user_id,
            profiles: {
              full_name: user?.user_metadata?.full_name || 
                        user?.user_metadata?.name || 
                        user?.email?.split('@')[0] || 
                        'Anonymous',
              avatar_url: user?.user_metadata?.avatar_url || '/placeholder.svg'
            },
            attachments: newMessage.attachments || []
          }])
        } else {
          // For other users, fetch their profile and metadata
          const [profileResult, metadataResult] = await Promise.all([
            supabase.from('profiles').select('email').eq('id', newMessage.user_id).single(),
            supabase.rpc('get_user_metadata', { user_id: newMessage.user_id })
          ])

          const metadata = metadataResult.data || {}
          const profile = profileResult.data

          setMessages(prev => [...prev, {
            id: newMessage.id,
            content: newMessage.content,
            created_at: newMessage.created_at,
            user_id: newMessage.user_id,
            profiles: {
              full_name: metadata.full_name || 
                        metadata.name || 
                        profile?.email?.split('@')[0] || 
                        'Anonymous',
              avatar_url: metadata.avatar_url || '/placeholder.svg'
            },
            attachments: newMessage.attachments || []
          }])
        }
      })
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [activeChannel, currentUser])

  const handleSendMessage = async (content: string, attachments?: { type: string; url: string }[]) => {
    if (!isPremium) {
      toast.error('Premium Required', {
        description: 'This feature is only available for premium users. Upgrade your account to access it.',
        action: {
          label: 'Upgrade',
          onClick: () => window.location.href = '/premium',
        },
      })
      return
    }

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    console.log('Sending message to channel:', activeChannel?.id)
    console.log('Attachments:', attachments)

    // Ensure attachments have proper type and URL
    const processedAttachments = attachments?.map(attachment => ({
      ...attachment,
      type: attachment.type || 'application/octet-stream',
      url: attachment.url
    })) || []

    const { error } = await supabase
      .from('messages')
      .insert({
        channel_id: activeChannel?.id,
        user_id: user.id,
        content,
        attachments: processedAttachments,
        created_at: new Date().toISOString()
      })

    if (error) {
      console.error('Error sending message:', error)
      toast.error('Failed to send message')
    }
  }

  return (
    <div className="flex h-[calc(100vh-4rem)] overflow-hidden">
      {/* Sidebar */}
      <div className={cn(
        "w-64 border-r bg-background flex flex-col relative z-20",
        isMobile && !isSidebarOpen && "hidden",
        isMobile && isSidebarOpen && "fixed inset-y-0 left-0 z-50 w-full"
      )}>
        <div className="sticky top-0 z-10 border-b bg-background p-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Channels</h2>
            {isMobile && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsSidebarOpen(false)}
              >
                <Menu className="h-5 w-5" />
              </Button>
            )}
          </div>
        </div>
        <div className="flex-1 min-h-0">
          <ScrollArea className="h-[calc(100vh-8rem)]">
            <div className="space-y-1 p-2">
              {channels.map((channel) => (
                <Button
                  key={channel.id}
                  variant={activeChannel?.id === channel.id ? "secondary" : "ghost"}
                  className="w-full justify-start"
                  onClick={() => {
                    setActiveChannel(channel)
                    if (isMobile) {
                      setIsSidebarOpen(false)
                    }
                  }}
                  disabled={isLoading}
                >
                  #{channel.name}
                </Button>
              ))}
            </div>
          </ScrollArea>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {isMobile && !isSidebarOpen && (
          <div className="p-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsSidebarOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        )}
        <ChatArea 
          channel={activeChannel} 
          messages={messages} 
          setMessages={setMessages}
          isLoading={isLoading}
        />
        <div className="sticky bottom-0 border-t bg-background p-4">
          <MessageInput onSendMessage={handleSendMessage} />
        </div>
      </div>
    </div>
  )
}

