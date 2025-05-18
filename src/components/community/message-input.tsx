"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { motion, AnimatePresence } from "framer-motion"
import { Loader2 } from "lucide-react"
import { createBrowserClient } from "@supabase/ssr"
import { toast } from "@/components/ui/use-toast"

interface MessageInputProps {
  onSendMessage: (content: string, attachments?: { type: string; url: string }[]) => void
}

const EMOJI_LIST = [
  "😀",
  "😃",
  "😄",
  "😁",
  "😆",
  "😅",
  "😂",
  "🤣",
  "😊",
  "😇",
  "🙂",
  "🙃",
  "😉",
  "😌",
  "😍",
  "🥰",
  "😘",
  "😗",
  "😙",
  "😚",
  "😋",
  "😛",
  "😝",
  "😜",
  "🤪",
  "🤨",
  "🧐",
  "🤓",
  "😎",
  "🤩",
  "👍",
  "👎",
  "❤️",
  "🔥",
  "🎉",
  "✨",
  "👏",
  "🙌",
  "🤝",
  "👋",
]

export function MessageInput({ onSendMessage }: MessageInputProps) {
  const [message, setMessage] = useState("")
  const [attachments, setAttachments] = useState<{ type: string; url: string; file: File }[]>([])
  const [isSending, setIsSending] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const handleSendMessage = async () => {
    if (message.trim() || attachments.length > 0) {
      setIsSending(true)
      try {
        // Upload files concurrently with better error handling
        const uploadedAttachments = await Promise.all(
          attachments.map(async (attachment) => {
            if (attachment.file.type.startsWith("image/")) {
              try {
                const fileExt = attachment.file.name.split('.').pop()
                const fileName = `${Math.random()}.${fileExt}`
                
                // Start the upload
                const uploadPromise = supabase.storage
                  .from('attachments')
                  .upload(fileName, attachment.file)

                // Get the public URL in parallel
                const urlPromise = supabase.storage
                  .from('attachments')
                  .getPublicUrl(fileName)

                // Wait for both operations to complete
                const [uploadResult, urlResult] = await Promise.all([
                  uploadPromise,
                  urlPromise
                ])

                if (uploadResult.error) {
                  throw uploadResult.error
                }

                return {
                  type: attachment.file.type,
                  url: urlResult.data.publicUrl
                }
              } catch (error) {
                console.error('Error processing file:', error)
                toast({
                  variant: "destructive",
                  title: "Upload Failed",
                  description: `Failed to upload ${attachment.file.name}`
                })
                return null
              }
            }
            return {
              type: attachment.type,
              url: attachment.url
            }
          })
        )

        // Filter out failed uploads
        const successfulUploads = uploadedAttachments.filter((attachment): attachment is { type: string; url: string } => 
          attachment !== null
        )

        // Send message with uploaded file URLs
        await onSendMessage(message, successfulUploads)
        setMessage("")
        setAttachments([])
      } catch (error) {
        console.error('Error sending message:', error)
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to send message"
        })
      } finally {
        setIsSending(false)
      }
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      const newAttachments = Array.from(files).map((file) => {
        if (file.type.startsWith("image/")) {
          // Create a URL for the image preview
          const imageUrl = URL.createObjectURL(file)
          return {
            type: file.type, // Use the actual MIME type
            url: imageUrl,
            file: file // Store the file for later upload
          }
        }
        return {
          type: file.type || 'application/octet-stream',
          url: `/placeholder.svg?height=300&width=400`,
          file: file
        }
      })

      setAttachments([...attachments, ...newAttachments])
    }
  }

  // Clean up object URLs when component unmounts or attachments change
  useEffect(() => {
    return () => {
      attachments.forEach(attachment => {
        if (attachment.type === "image" && attachment.url.startsWith("blob:")) {
          URL.revokeObjectURL(attachment.url)
        }
      })
    }
  }, [attachments])

  const handleEmojiClick = (emoji: string) => {
    setMessage((prev) => prev + emoji)
  }

  return (
    <div className="space-y-2">
      {attachments.length > 0 && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="flex flex-wrap gap-2"
        >
          {attachments.map((attachment, index) => (
            <motion.div 
              key={index} 
              className="relative"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
            >
              {attachment.type === "image" && (
                <img
                  src={attachment.url || "/placeholder.svg"}
                  alt="Attachment preview"
                  className="h-20 w-20 rounded object-cover"
                />
              )}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="absolute -right-2 -top-2 rounded-full bg-destructive p-1 text-white"
                onClick={() => {
                  setAttachments(attachments.filter((_, i) => i !== index))
                }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-x"
                >
                  <path d="M18 6 6 18" />
                  <path d="m6 6 12 12" />
                </svg>
              </motion.button>
            </motion.div>
          ))}
        </motion.div>
      )}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            className="min-h-[48px] h-[48px] py-3 pl-24 pr-4 flex-1 resize-none leading-normal [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
            style={{
              height: message.split('\n').length > 1 ? 'auto' : '48px',
              paddingTop: message.split('\n').length > 1 ? '0.5rem' : '0.875rem',
              paddingBottom: message.split('\n').length > 1 ? '0.5rem' : '0.875rem'
            }}
          />
          <div className="absolute left-2 top-1/2 -translate-y-1/2 flex items-center">
            <div className="flex items-center gap-2 pr-2">
              <Button type="button" size="icon" variant="ghost" className="h-8 w-8" onClick={() => fileInputRef.current?.click()}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-image"
                >
                  <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
                  <circle cx="9" cy="9" r="2" />
                  <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
                </svg>
                <span className="sr-only">Attach image</span>
              </Button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                className="hidden"
                multiple
              />

              <Popover>
                <PopoverTrigger asChild>
                  <Button type="button" size="icon" variant="ghost" className="h-8 w-8">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="lucide lucide-smile"
                    >
                      <circle cx="12" cy="12" r="10" />
                      <path d="M8 14s1.5 2 4 2 4-2 4-2" />
                      <line x1="9" x2="9.01" y1="9" y2="9" />
                      <line x1="15" x2="15.01" y1="9" y2="9" />
                    </svg>
                    <span className="sr-only">Emoji</span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-64 p-2">
                  <div className="grid grid-cols-8 gap-1">
                    {EMOJI_LIST.map((emoji, index) => (
                      <motion.button
                        key={index}
                        whileHover={{ scale: 1.2 }}
                        whileTap={{ scale: 0.9 }}
                        className="flex h-8 w-8 items-center justify-center rounded hover:bg-accent"
                        onClick={() => handleEmojiClick(emoji)}
                      >
                        {emoji}
                      </motion.button>
                    ))}
                  </div>
                </PopoverContent>
              </Popover>
            </div>
            <div className="h-6 w-px bg-border" />
          </div>
        </div>

        <Button
          type="button"
          size="icon"
          onClick={handleSendMessage}
          disabled={isSending || (!message.trim() && attachments.length === 0)}
          className={isSending ? "pointer-events-none" : ""}
          title={isSending ? "Sending message..." : "Send message"}
          aria-label={isSending ? "Sending message..." : "Send message"}
        >
          {isSending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <motion.svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="lucide lucide-send"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <path d="m22 2-7 20-4-9-9-4Z" />
              <path d="M22 2 11 13" />
            </motion.svg>
          )}
        </Button>
      </div>
    </div>
  )
}
