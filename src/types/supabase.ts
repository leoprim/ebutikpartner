export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      video_progress: {
        Row: {
          id: number
          user_id: string
          video_id: string
          progress: number
          timestamp: number
          is_completed: boolean
          updated_at: string
        }
        Insert: {
          id?: number
          user_id: string
          video_id: string
          progress: number
          timestamp: number
          is_completed: boolean
          updated_at?: string
        }
        Update: {
          id?: number
          user_id?: string
          video_id?: string
          progress?: number
          timestamp?: number
          is_completed?: boolean
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
} 