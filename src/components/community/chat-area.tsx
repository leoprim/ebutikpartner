"use client"

import { ScrollArea } from "@/components/ui/scroll-area"
import { useEffect, useRef, useState } from "react"
import { createBrowserClient } from "@supabase/ssr"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { FileIcon } from "lucide-react"
import Image from "next/image"

interface ChatAreaProps {
  channel: {
    id: string
    name: string
    description: string
  }
  messages: Array<{
    id: string
    content: string
    created_at: string
    user_id: string
    profiles?: {
      full_name: string
      avatar_url: string
    }
    attachments?: Array<{
      id: string
      url: string
      type: string
    }>
  }>
  setMessages: React.Dispatch<React.SetStateAction<Array<{
    id: string
    content: string
    created_at: string
    user_id: string
    profiles?: {
      full_name: string
      avatar_url: string
    }
    attachments?: Array<{
      id: string
      url: string
      type: string
    }>
  }>>>
  isLoading?: boolean
}

function MessageSkeleton() {
  return (
    <div className="flex items-start gap-2 animate-pulse">
      <div className="h-8 w-8 rounded-full bg-muted" />
      <div className="flex-1 space-y-2">
        <div className="flex items-center gap-2">
          <div className="h-4 w-24 rounded bg-muted" />
          <div className="h-3 w-12 rounded bg-muted" />
        </div>
        <div className="h-16 w-3/4 rounded-lg bg-muted" />
      </div>
    </div>
  )
}

function MessageSkeletonRight() {
  return (
    <div className="flex items-start gap-2 animate-pulse flex-row-reverse">
      <div className="h-8 w-8 rounded-full bg-muted" />
      <div className="flex-1 space-y-2">
        <div className="flex items-center gap-2 flex-row-reverse">
          <div className="h-4 w-24 rounded bg-muted" />
          <div className="h-3 w-12 rounded bg-muted" />
        </div>
        <div className="h-16 w-3/4 rounded-lg bg-muted ml-auto" />
      </div>
    </div>
  )
}

function MessageSkeletonGroup() {
  return (
    <div className="space-y-4">
      <MessageSkeleton />
      <div className="flex items-start gap-2 animate-pulse">
        <div className="w-8" />
        <div className="flex-1 space-y-2">
          <div className="h-12 w-1/2 rounded-lg bg-muted" />
        </div>
      </div>
      <MessageSkeletonRight />
      <div className="flex items-start gap-2 animate-pulse flex-row-reverse">
        <div className="w-8" />
        <div className="flex-1 space-y-2">
          <div className="h-12 w-1/2 rounded-lg bg-muted ml-auto" />
        </div>
      </div>
      <MessageSkeleton />
    </div>
  )
}

export function ChatArea({ channel, messages, setMessages, isLoading }: ChatAreaProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [currentUser, setCurrentUser] = useState<{
    id: string;
    email?: string;
    user_metadata?: {
      full_name?: string;
      name?: string;
      avatar_url?: string;
    };
  } | null>(null)
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  const scrollRef = useRef<HTMLDivElement>(null)
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [hasMoreMessages, setHasMoreMessages] = useState(true)
  const oldestMessageRef = useRef<HTMLDivElement>(null)
  const previousMessageCount = useRef(messages.length)

  useEffect(() => {
    if (messages.length > previousMessageCount.current) {
      // Force re-render when new messages arrive
      previousMessageCount.current = messages.length
    }
    previousMessageCount.current = messages.length
  }, [messages.length])

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setCurrentUser(user)
    }
    getUser()
  }, [supabase])

  useEffect(() => {
    if (shouldAutoScroll) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }
  }, [messages, shouldAutoScroll])

  const handleScroll = async () => {
    if (!scrollRef.current) return
    
    const { scrollTop, scrollHeight, clientHeight } = scrollRef.current
    const isAtBottom = scrollHeight - scrollTop - clientHeight < 100
    setShouldAutoScroll(isAtBottom)

    if (scrollTop < 100 && !isLoadingMore && hasMoreMessages) {
      setIsLoadingMore(true)
      try {
        const oldestMessage = messages[0]
        if (!oldestMessage) return

        const { data: olderMessages, error } = await supabase
          .from('messages')
          .select('*')
          .eq('channel_id', channel.id)
          .lt('created_at', oldestMessage.created_at)
          .order('created_at', { ascending: false })
          .limit(20)

        if (error) throw error

        if (olderMessages.length < 20) {
          setHasMoreMessages(false)
        }

        const messagesWithUserData = await Promise.all(olderMessages.map(async (msg) => {
          if (msg.user_id === currentUser?.id) {
            const { data: { user } } = await supabase.auth.getUser()
            return {
              id: msg.id,
              content: msg.content,
              created_at: msg.created_at,
              user_id: msg.user_id,
              profiles: {
                full_name: user?.user_metadata?.full_name || 
                          user?.user_metadata?.name || 
                          user?.email?.split('@')[0] || 
                          'Anonymous',
                avatar_url: user?.user_metadata?.avatar_url || '/placeholder.svg'
              },
              attachments: msg.attachments || []
            }
          } else {
            const [profileResult, metadataResult] = await Promise.all([
              supabase.from('profiles').select('email').eq('id', msg.user_id).single(),
              supabase.rpc('get_user_metadata', { user_id: msg.user_id })
            ])

            const metadata = metadataResult.data || {}
            const profile = profileResult.data

            return {
              id: msg.id,
              content: msg.content,
              created_at: msg.created_at,
              user_id: msg.user_id,
              profiles: {
                full_name: metadata.full_name || 
                          metadata.name || 
                          profile?.email?.split('@')[0] || 
                          'Anonymous',
                avatar_url: metadata.avatar_url || '/placeholder.svg'
              },
              attachments: msg.attachments || []
            }
          }
        }))

        const scrollHeightBefore = scrollRef.current.scrollHeight
        const scrollTopBefore = scrollRef.current.scrollTop

        setMessages(prev => [...messagesWithUserData, ...prev])

        requestAnimationFrame(() => {
          if (scrollRef.current) {
            const scrollHeightAfter = scrollRef.current.scrollHeight
            const scrollTopAfter = scrollHeightAfter - scrollHeightBefore + scrollTopBefore
            scrollRef.current.scrollTop = scrollTopAfter
          }
        })
      } catch (error) {
        console.error('Error loading older messages:', error)
      } finally {
        setIsLoadingMore(false)
      }
    }
  }

  return (
    <div className="flex h-full flex-col">
      <div className="sticky top-0 z-10 border-b bg-background p-4 md:hidden">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <h2 className="text-lg font-medium">#{channel.name}</h2>
            <span className="text-sm text-muted-foreground">
              {channel.description}
            </span>
          </div>
        </div>
      </div>
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full" ref={scrollRef} onScroll={handleScroll}>
          <div className="space-y-2 p-4 pt-24 pb-12">
            {isLoading ? (
              <div className="space-y-6">
                <MessageSkeletonGroup />
                <MessageSkeletonGroup />
                <MessageSkeletonGroup />
              </div>
            ) : (
              <AnimatePresence initial={false} mode="popLayout">
                {messages.map((message, index) => {
                  const isCurrentUser = message.user_id === currentUser?.id
                  const isFirstInGroup = 
                    index === 0 ||
                    messages[index - 1]?.user_id !== message.user_id ||
                    new Date(message.created_at).getTime() -
                      new Date(messages[index - 1]?.created_at).getTime() >
                      5 * 60 * 1000

                  const isLastInGroup = 
                    index === messages.length - 1 ||
                    messages[index + 1]?.user_id !== message.user_id ||
                    new Date(messages[index + 1]?.created_at).getTime() -
                      new Date(message.created_at).getTime() >
                      5 * 60 * 1000
                      
                  const isLastMessage = index === messages.length - 1

                  return (
                    <motion.div
                      key={message.id}
                      ref={index === 0 ? oldestMessageRef : null}
                      initial={isLastMessage ? { 
                        opacity: 0, 
                        x: isCurrentUser ? 20 : -20,
                        scale: 0.95
                      } : { opacity: 1, x: 0, scale: 1 }}
                      animate={{ 
                        opacity: 1, 
                        x: 0,
                        scale: 1 
                      }}
                      transition={{ 
                        duration: 0.2,
                        type: "spring", 
                        stiffness: 260, 
                        damping: 20 
                      }}
                      className={cn(
                        "group flex items-start gap-2",
                        isCurrentUser && "flex-row-reverse",
                        !isFirstInGroup && "mt-0.5",
                        isLastInGroup && "mb-2"
                      )}
                    >
                      {isFirstInGroup && (
                        <motion.div
                          initial={isLastMessage ? { scale: 0.8, opacity: 0 } : { scale: 1, opacity: 1 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ delay: 0.1 }}
                        >
                          <Avatar className="h-8 w-8">
                            <AvatarImage
                              src={message.profiles?.avatar_url}
                              alt={message.profiles?.full_name || "User"}
                            />
                            <AvatarFallback>
                              {message.profiles?.full_name
                                ?.split(" ")
                                .map((n) => n[0])
                                .join("") || "U"}
                            </AvatarFallback>
                          </Avatar>
                        </motion.div>
                      )}
                      {!isFirstInGroup && <div className="w-8" />}
                      <div
                        className={cn(
                          "flex max-w-[80%] flex-col",
                          isCurrentUser && "items-end"
                        )}
                      >
                        {isFirstInGroup && (
                          <motion.div
                            initial={isLastMessage ? { opacity: 0, y: -5 } : { opacity: 1, y: 0 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.15 }}
                            className={cn(
                              "mb-1 flex items-center gap-2",
                              isCurrentUser && "flex-row-reverse"
                            )}
                          >
                            <span className="text-sm font-medium">
                              {message.profiles?.full_name}
                            </span>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <span className="text-xs text-muted-foreground">
                                  {new Date(message.created_at).toLocaleTimeString(
                                    undefined,
                                    {
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    }
                                  )}
                                </span>
                              </TooltipTrigger>
                              <TooltipContent
                                side="top"
                                className="bg-muted text-muted-foreground"
                              >
                                {new Date(message.created_at).toLocaleString()}
                              </TooltipContent>
                            </Tooltip>
                          </motion.div>
                        )}
                        <motion.div
                          initial={isLastMessage ? { 
                            opacity: 0, 
                            scale: 0.9,
                            x: isCurrentUser ? 10 : -10
                          } : { 
                            opacity: 1, 
                            scale: 1,
                            x: 0
                          }}
                          animate={{ 
                            opacity: 1, 
                            scale: 1,
                            x: 0
                          }}
                          transition={{ 
                            type: "spring", 
                            stiffness: 500, 
                            damping: 30,
                            delay: isFirstInGroup ? 0.2 : 0.1
                          }}
                          className={cn(
                            "rounded-lg px-4 py-2",
                            isCurrentUser
                              ? "bg-primary text-white font-normal text-sm"
                              : "bg-muted font-normal text-sm"
                          )}
                        >
                          <p className="whitespace-pre-wrap break-words">
                            {message.content}
                          </p>
                        </motion.div>
                        {message.attachments && message.attachments.length > 0 && (
                          <motion.div 
                            initial={isLastMessage ? { opacity: 0, y: 10 } : { opacity: 1, y: 0 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className={cn(
                              "mt-2",
                              isCurrentUser ? "ml-auto" : "mr-auto"
                            )}
                          >
                            <div
                              className={cn(
                                "grid gap-2",
                                message.attachments.length === 1
                                  ? "grid-cols-1"
                                  : "grid-cols-2"
                              )}
                            >
                              {message.attachments.map((attachment) => {
                                const isImage = attachment.type?.startsWith("image/") || false
                                const fileType = attachment.type?.split('/')[1] || 'file'
                                return (
                                  <Dialog key={`${message.id}-${attachment.id}`}>
                                    <DialogTrigger asChild>
                                      <div
                                        className={cn(
                                          "relative cursor-pointer overflow-hidden rounded-lg",
                                          isImage
                                            ? "h-[300px] w-[400px]"
                                            : "aspect-video"
                                        )}
                                      >
                                        {isImage ? (
                                          <Image
                                            src={attachment.url}
                                            alt="Attachment"
                                            className="h-full w-full object-cover transition-transform hover:scale-105"
                                            fill
                                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                          />
                                        ) : (
                                          <div className="flex h-full items-center justify-center bg-muted">
                                            <FileIcon className="h-8 w-8 text-muted-foreground" />
                                          </div>
                                        )}
                                      </div>
                                    </DialogTrigger>
                                    <DialogContent className="max-w-5xl p-0">
                                      <DialogTitle className="sr-only">Image Preview</DialogTitle>
                                      <DialogDescription className="sr-only">Preview of the attached image</DialogDescription>
                                      {isImage ? (
                                        <div className="relative w-full">
                                          <Image
                                            src={attachment.url}
                                            alt="Attachment"
                                            className="w-full h-auto"
                                            width={1920}
                                            height={1080}
                                            style={{ maxHeight: '90vh' }}
                                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                          />
                                        </div>
                                      ) : (
                                        <div className="flex h-full items-center justify-center">
                                          <a
                                            href={attachment.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-2 text-primary hover:underline"
                                          >
                                            <FileIcon className="h-4 w-4" />
                                            Open {fileType.toUpperCase()} file
                                          </a>
                                        </div>
                                      )}
                                    </DialogContent>
                                  </Dialog>
                                )
                              })}
                            </div>
                          </motion.div>
                        )}
                      </div>
                    </motion.div>
                  )
                })}
              </AnimatePresence>
            )}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>
      </div>
    </div>
  )
}
