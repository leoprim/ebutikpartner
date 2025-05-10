"use client"

import type { Channel } from "@/types/community"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"

interface ChannelSidebarProps {
  channels: Channel[]
  activeChannel: Channel
  onSelectChannel: (channel: Channel) => void
}

export function ChannelSidebar({ channels, activeChannel, onSelectChannel }: ChannelSidebarProps) {
  return (
    <div className="flex h-full flex-col">
      <div className="border-b p-4">
        <h2 className="text-xl font-bold">Community</h2>
      </div>
      <ScrollArea className="flex-1">
        <div className="p-2">
          <div className="mb-2 px-2 text-sm font-semibold text-muted-foreground">CHANNELS</div>
          <div className="space-y-1">
            {channels.map((channel) => (
              <Button
                key={channel.id}
                variant="ghost"
                className={cn("w-full justify-start", activeChannel.id === channel.id && "bg-accent")}
                onClick={() => onSelectChannel(channel)}
              >
                <span className="mr-2">#</span>
                {channel.name}
              </Button>
            ))}
          </div>
        </div>
      </ScrollArea>
      <div className="border-t p-4">
        <div className="flex items-center">
          <div className="h-8 w-8 rounded-full bg-primary">
            <img src="/placeholder.svg?height=32&width=32" alt="Your avatar" className="h-8 w-8 rounded-full" />
          </div>
          <div className="ml-2">
            <div className="text-sm font-medium">You</div>
            <div className="text-xs text-muted-foreground">Online</div>
          </div>
        </div>
      </div>
    </div>
  )
}
