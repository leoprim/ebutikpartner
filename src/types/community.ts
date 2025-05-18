export interface User {
    id: string
    name: string
    avatar: string
  }
  
  export interface Channel {
    id: string
    name: string
    description: string
    icon?: string
    lastMessage?: {
      content: string
      sender: string
      timestamp: string
    }
  }
  
  export interface Attachment {
    id: string
    type: string
    url: string
  }
  
  export interface Message {
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
  }
  