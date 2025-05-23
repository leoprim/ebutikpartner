"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { MessageInput } from "@/components/community/message-input"
import { ChatArea } from "@/components/community/chat-area"
import { useIsMobile } from "@/hooks/use-mobile"
import { Menu, Megaphone, Wrench, Crown, Flame } from "lucide-react"
import { cn } from "@/lib/utils"
import { createBrowserClient } from "@supabase/ssr"
import type { Channel, Message } from "@/types/community"
import { addToast } from "@heroui/react"
import { motion, AnimatePresence } from "framer-motion"

const channels: Channel[] = [
  {
    id: "1",
    name: "Premium chatt",
    description: "Generell diskussion om e-handel",
    icon: "Crown",
  },
  {
    id: "2",
    name: "Tips & Tricks",
    description: "Dela med dig av tips och tricks",
    icon: "Flame",
  },
  {
    id: "3",
    name: "technical",
    description: "Technical discussions and support",
    icon: "Wrench",
  },
]

// Helper function to get icon component
const getChannelIcon = (iconName: string | undefined) => {
  switch (iconName) {
    case "Crown":
      return <Crown className="h-5 w-5" />
    case "Flame":
      return <Flame className="h-5 w-5" />
    case "Wrench":
      return <Wrench className="h-5 w-5" />
    default:
      return <Crown className="h-5 w-5" />
  }
}

interface CommunityChatProps {
  initialMessages?: Message[]
}

// Channel Skeleton Component
function ChannelSkeleton() {
  return (
    <div className="flex flex-col rounded-md p-3 animate-pulse">
      <div className="flex items-center mb-1 justify-between">
        <div className="flex items-center">
          <div className="w-8 h-8 rounded-md bg-muted mr-2"></div>
          <div className="h-4 w-24 bg-muted rounded"></div>
        </div>
      </div>
      <div className="pl-10 mt-1">
        <div className="flex justify-between items-center">
          <div className="h-3 w-32 bg-muted rounded"></div>
          <div className="h-3 w-8 bg-muted rounded"></div>
        </div>
      </div>
    </div>
  )
}

function ChannelSkeletonGroup() {
  return (
    <div className="space-y-2">
      <ChannelSkeleton />
      <ChannelSkeleton />
      <ChannelSkeleton />
    </div>
  )
}

export function CommunityChat({ initialMessages = [] }: CommunityChatProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [activeChannel, setActiveChannel] = useState<Channel>(channels[0])
  const [channelsWithLatestMessages, setChannelsWithLatestMessages] = useState<Channel[]>(channels)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isPremium, setIsPremium] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isChannelsLoading, setIsChannelsLoading] = useState(true)
  const [lastVisitedTime, setLastVisitedTime] = useState<Record<string, string>>({})
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

  // Load last visited times from localStorage
  useEffect(() => {
    const storedVisitTimes = localStorage.getItem('channelLastVisit')
    if (storedVisitTimes) {
      setLastVisitedTime(JSON.parse(storedVisitTimes))
    }
  }, [])

  // Update last visited time when changing channels
  useEffect(() => {
    if (!activeChannel || !currentUser) return
    
    const now = new Date().toISOString()
    setLastVisitedTime(prev => {
      const updated = { ...prev, [activeChannel.id]: now }
      localStorage.setItem('channelLastVisit', JSON.stringify(updated))
      return updated
    })
    
    // Reset unread count for this channel
    setChannelsWithLatestMessages(prev => 
      prev.map(ch => ch.id === activeChannel.id ? { ...ch, unreadCount: 0 } : ch)
    )
  }, [activeChannel, currentUser])

  // Function to fetch messages for a specific channel
  const fetchMessagesForChannel = async (channelId: string) => {
    try {
      console.log('Fetching messages for channel:', channelId)
      
      // Fetch messages
      const { data: messages, error: messagesError } = await supabase
        .from('messages')
        .select('*')
        .eq('channel_id', channelId)
        .order('created_at', { ascending: true })
        .limit(20)

      if (messagesError) throw messagesError

      // Get unique user IDs
      const userIds = Array.from(new Set(messages?.map(msg => msg.user_id) || []))

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
      
      // If this is the active channel, update the messages state
      if (channelId === activeChannel.id) {
        setMessages(messagesWithUserData)
        setIsLoading(false)
      }
      
      // Update latest message for channel
      if (messagesWithUserData.length > 0) {
        const latestMessage = messagesWithUserData[messagesWithUserData.length - 1];
        
        // Calculate unread messages
        let unreadCount = 0;
        const lastVisit = lastVisitedTime[channelId];
        if (lastVisit) {
          unreadCount = messagesWithUserData.filter(msg => 
            new Date(msg.created_at) > new Date(lastVisit)
          ).length;
        }
        
        setChannelsWithLatestMessages(prev => 
          prev.map(channel => 
            channel.id === channelId 
              ? {
                  ...channel,
                  lastMessage: {
                    content: latestMessage.content.length > 25 
                      ? latestMessage.content.substring(0, 25) + '...' 
                      : latestMessage.content,
                    timestamp: new Date(latestMessage.created_at).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit'
                    })
                  },
                  unreadCount: channelId === activeChannel.id ? 0 : unreadCount
                }
              : channel
          )
        );
      }
      
      return messagesWithUserData;
    } catch (error) {
      console.error('Error fetching messages for channel:', channelId, error)
      return [];
    }
  }

  const fetchMessages = async () => {
    try {
      setIsLoading(true)
      await fetchMessagesForChannel(activeChannel.id)
    } catch (error) {
      console.error('Error fetching messages:', error)
      addToast({ title: 'Failed to load messages', color: 'danger' })
      setIsLoading(false)
    }
  }
  
  // Function to update latest message for a channel
  const updateLatestMessage = (channelId: string, messages: Message[]) => {
    if (messages.length === 0) return;
    
    const latestMessage = messages[messages.length - 1];
    
    setChannelsWithLatestMessages(prev => 
      prev.map(channel => {
        if (channel.id === channelId) {
          // Increment unread count if this is not the active channel
          const isActive = channelId === activeChannel.id;
          const currentUnreadCount = channel.unreadCount || 0;
          const newUnreadCount = isActive ? 0 : currentUnreadCount + 1;
          
          return {
            ...channel,
            lastMessage: {
              content: latestMessage.content.length > 25 
                ? latestMessage.content.substring(0, 25) + '...' 
                : latestMessage.content,
              timestamp: new Date(latestMessage.created_at).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit'
              })
            },
            unreadCount: newUnreadCount
          };
        }
        return channel;
      })
    );
  }

  // Load previews for all channels initially
  useEffect(() => {
    if (!currentUser) return;
    
    const loadAllChannelPreviews = async () => {
      setIsChannelsLoading(true);
      // Fetch previews for all channels
      for (const channel of channels) {
        await fetchMessagesForChannel(channel.id);
      }
      setIsChannelsLoading(false);
    };
    
    loadAllChannelPreviews();
  }, [currentUser]);

  useEffect(() => {
    if (activeChannel) {
      fetchMessages()
    }
  }, [activeChannel, currentUser])

  // Create a more direct way to replace temp messages with real ones
  const replaceTempMessage = (tempId: string, realMessage: any) => {
    setMessages(prev => 
      prev.map(msg => 
        msg.id === tempId 
          ? { ...msg, id: realMessage.id, created_at: realMessage.created_at } 
          : msg
      )
    );
  };

  useEffect(() => {
    if (!currentUser) return;
    
    // Create subscriptions for all channels
    const subscriptions = channels.map(channel => {
      return supabase
        .channel(`messages:${channel.id}`)
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `channel_id=eq.${channel.id}`
        }, async (payload) => {
          const newMessage = payload.new;
          const isActiveChannel = channel.id === activeChannel.id;
          
          // Skip if we already have this exact message
          if (isActiveChannel && messages.some(msg => msg.id === newMessage.id)) {
            return;
          }
          
          // Handle temp message replacement
          const tempMessage = isActiveChannel ? 
            messages.find(msg => 
              msg.id.startsWith('temp-') && 
              msg.content === newMessage.content && 
              msg.user_id === newMessage.user_id
            ) : null;

          // Get user profile info
          let userProfile = { full_name: 'Anonymous', avatar_url: '/placeholder.svg' };
          
          try {
            if (newMessage.user_id === currentUser?.id) {
              const { data: { user } } = await supabase.auth.getUser();
              userProfile = {
                full_name: user?.user_metadata?.full_name || 
                          user?.user_metadata?.name || 
                          user?.email?.split('@')[0] || 
                          'Anonymous',
                avatar_url: user?.user_metadata?.avatar_url || '/placeholder.svg'
              };
            } else {
              const [profileResult, metadataResult] = await Promise.all([
                supabase.from('profiles').select('email').eq('id', newMessage.user_id).single(),
                supabase.rpc('get_user_metadata', { user_id: newMessage.user_id })
              ]);
              
              const metadata = metadataResult.data || {};
              const profile = profileResult.data;
              
              userProfile = {
                full_name: metadata.full_name || 
                          metadata.name || 
                          profile?.email?.split('@')[0] || 
                          'Anonymous',
                avatar_url: metadata.avatar_url || '/placeholder.svg'
              };
            }
          } catch (error) {
            console.error('Error getting user profile:', error);
          }

          // Update messages for active channel
          if (isActiveChannel) {
            if (tempMessage) {
              // Replace temp message
              replaceTempMessage(tempMessage.id, newMessage);
            } else {
              // Add new message
              setMessages(prev => [...prev, {
                id: newMessage.id,
                content: newMessage.content,
                created_at: newMessage.created_at,
                user_id: newMessage.user_id,
                profiles: userProfile,
                attachments: newMessage.attachments || []
              }]);
            }
          }
          
          // Update channel preview regardless of active status
          setChannelsWithLatestMessages(prev => 
            prev.map(ch => {
              if (ch.id === channel.id) {
                // Only increment unread count for non-active channels
                const currentUnreadCount = ch.unreadCount || 0;
                const newUnreadCount = isActiveChannel ? 0 : currentUnreadCount + 1;
                
                return {
                  ...ch,
                  lastMessage: {
                    content: newMessage.content.length > 25 
                      ? newMessage.content.substring(0, 25) + '...'
                      : newMessage.content,
                    timestamp: new Date(newMessage.created_at).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit'
                    })
                  },
                  unreadCount: newUnreadCount
                };
              }
              return ch;
            })
          );
        })
        .subscribe();
    });
    
    return () => {
      subscriptions.forEach(subscription => subscription.unsubscribe());
    };
  }, [activeChannel, currentUser, messages]);

  const handleSendMessage = async (content: string, attachments?: { type: string; url: string }[]) => {
    if (!isPremium) {
      addToast({ title: 'Premium Required', description: 'This feature is only available for premium users. Upgrade your account to access it.', color: 'secondary' })
      return
    }

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    // Create unique ID with timestamp
    const tempId = `temp-${Date.now()}`
    
    // Create optimistic message
    const optimisticMessage: Message = {
      id: tempId,
      content,
      created_at: new Date().toISOString(),
      user_id: user.id,
      profiles: {
        full_name: user?.user_metadata?.full_name || 
                  user?.user_metadata?.name || 
                  user?.email?.split('@')[0] || 
                  'Anonymous',
        avatar_url: user?.user_metadata?.avatar_url || '/placeholder.svg'
      },
      attachments: attachments?.map(attachment => ({
        id: `${tempId}-attachment-${Math.random().toString(36).substring(2, 9)}`,
        type: attachment.type,
        url: attachment.url
      })) || []
    }

    // Add optimistic message
    setMessages(prev => [...prev, optimisticMessage])
    
    // Update latest message for the channel
    updateLatestMessage(activeChannel.id, [...messages, optimisticMessage]);

    try {
      const { error, data } = await supabase
        .from('messages')
        .insert({
          channel_id: activeChannel?.id,
          user_id: user.id,
          content,
          attachments: attachments?.map(attachment => ({
            id: `${tempId}-attachment-${Math.random().toString(36).substring(2, 9)}`,
            type: attachment.type,
            url: attachment.url
          })) || [],
          created_at: new Date().toISOString()
        })
        .select()

      if (error) {
        // Remove optimistic message on error
        setMessages(prev => prev.filter(msg => msg.id !== optimisticMessage.id))
        console.error('Error sending message:', error)
        addToast({ title: 'Failed to send message', color: 'danger' })
      } else if (data && data[0]) {
        // Replace temp message with real one
        replaceTempMessage(tempId, data[0]);
      }
    } catch (error) {
      // Remove optimistic message on error
      setMessages(prev => prev.filter(msg => msg.id !== optimisticMessage.id))
      console.error('Error sending message:', error)
      addToast({ title: 'Failed to send message', color: 'danger' })
    }
  }

  return (
    <div className="flex h-[calc(100vh-4rem)] overflow-hidden">
      {/* Sidebar */}
      <div className={cn(
        "w-72 border-r bg-background flex flex-col relative z-20",
        isMobile && !isSidebarOpen && "hidden",
        isMobile && isSidebarOpen && "fixed inset-y-0 left-0 z-50 w-full"
      )}>
        <div className="flex-1 min-h-0">
          <ScrollArea className="h-[calc(100vh-4rem)]">
            <div className="space-y-2 p-3">
              <AnimatePresence>
                {isChannelsLoading ? (
                  <ChannelSkeletonGroup />
                ) : (
                  channelsWithLatestMessages.map((channel) => (
                    <motion.div
                      key={channel.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                      className={cn(
                        "flex flex-col rounded-md p-3 cursor-pointer transition-colors",
                        activeChannel?.id === channel.id 
                          ? "bg-accent" 
                          : "hover:bg-muted"
                      )}
                      onClick={() => {
                        setActiveChannel(channel)
                        if (isMobile) {
                          setIsSidebarOpen(false)
                        }
                      }}
                    >
                      <div className="flex items-center mb-1 justify-between">
                        <div className="flex items-center">
                          <div className={cn(
                            "w-8 h-8 rounded-md flex items-center justify-center mr-2",
                            activeChannel?.id === channel.id 
                              ? "bg-primary text-primary-foreground" 
                              : "bg-muted-foreground/20 text-muted-foreground"
                          )}>
                            {getChannelIcon(channel.icon)}
                          </div>
                          <span className="font-medium">{channel.name}</span>
                        </div>
                        {(channel.unreadCount ?? 0) > 0 && (
                          <motion.div 
                            initial={{ scale: 0.5 }}
                            animate={{ scale: 1 }}
                            className="flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white font-medium"
                          >
                            {(channel.unreadCount ?? 0) > 9 ? '9+' : channel.unreadCount}
                          </motion.div>
                        )}
                      </div>
                      
                      {channel.lastMessage && (
                        <div className="pl-10 text-sm text-muted-foreground">
                          <div className="flex justify-between items-center">
                            <p className="truncate max-w-[140px]">{channel.lastMessage.content}</p>
                            <span className="text-xs ml-1 shrink-0">{channel.lastMessage.timestamp}</span>
                          </div>
                        </div>
                      )}
                    </motion.div>
                  ))
                )}
              </AnimatePresence>
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


