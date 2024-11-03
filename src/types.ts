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
      profiles: {
        Row: {
          id: string
          username: string
          created_at: string
        }
        Insert: {
          id: string
          username: string
          created_at?: string
        }
        Update: {
          id?: string
          username?: string
          created_at?: string
        }
      }
      posts: {
        Row: {
          id: string
          title: string
          content: string
          image_url?: string
          user_id: string
          created_at: string
        }
        Insert: {
          id?: string
          title: string
          content: string
          image_url?: string
          user_id: string
          created_at?: string
        }
        Update: {
          id?: string
          title?: string
          content?: string
          image_url?: string
          user_id?: string
          created_at?: string
        }
      }
      comments: {
        Row: {
          id: string
          content: string
          post_id: string
          user_id: string
          created_at: string
        }
        Insert: {
          id?: string
          content: string
          post_id: string
          user_id: string
          created_at?: string
        }
        Update: {
          id?: string
          content?: string
          post_id?: string
          user_id?: string
          created_at?: string
        }
      }
    }
  }
}