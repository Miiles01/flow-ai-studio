export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      ai_conversations: {
        Row: {
          created_at: string
          id: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          title?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      ai_instructions: {
        Row: {
          content: string
          key: string
          updated_at: string
        }
        Insert: {
          content?: string
          key: string
          updated_at?: string
        }
        Update: {
          content?: string
          key?: string
          updated_at?: string
        }
        Relationships: []
      }
      ai_messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string
          id: string
          role: string
          user_id: string
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string
          id?: string
          role: string
          user_id: string
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string
          id?: string
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "ai_conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      brand_programs: {
        Row: {
          avg_sales: number
          banner_position: number
          banner_url: string | null
          brand_name: string
          category: string
          commission_rate: string | null
          created_at: string
          description: string
          gallery_images: Json
          id: string
          is_featured: boolean
          logo_url: string | null
          name: string
          price_max: number | null
          price_min: number | null
          program_url: string | null
          public_token: string | null
          slug: string
          updated_at: string
        }
        Insert: {
          avg_sales?: number
          banner_position?: number
          banner_url?: string | null
          brand_name: string
          category?: string
          commission_rate?: string | null
          created_at?: string
          description?: string
          gallery_images?: Json
          id?: string
          is_featured?: boolean
          logo_url?: string | null
          name: string
          price_max?: number | null
          price_min?: number | null
          program_url?: string | null
          public_token?: string | null
          slug: string
          updated_at?: string
        }
        Update: {
          avg_sales?: number
          banner_position?: number
          banner_url?: string | null
          brand_name?: string
          category?: string
          commission_rate?: string | null
          created_at?: string
          description?: string
          gallery_images?: Json
          id?: string
          is_featured?: boolean
          logo_url?: string | null
          name?: string
          price_max?: number | null
          price_min?: number | null
          program_url?: string | null
          public_token?: string | null
          slug?: string
          updated_at?: string
        }
        Relationships: []
      }
      business_inquiries: {
        Row: {
          company: string | null
          created_at: string
          email: string
          id: string
          message: string | null
          name: string
          phone: string | null
          status: string
          team_size: string | null
          updated_at: string
          web_or_socials: string | null
        }
        Insert: {
          company?: string | null
          created_at?: string
          email: string
          id?: string
          message?: string | null
          name: string
          phone?: string | null
          status?: string
          team_size?: string | null
          updated_at?: string
          web_or_socials?: string | null
        }
        Update: {
          company?: string | null
          created_at?: string
          email?: string
          id?: string
          message?: string | null
          name?: string
          phone?: string | null
          status?: string
          team_size?: string | null
          updated_at?: string
          web_or_socials?: string | null
        }
        Relationships: []
      }
      flow_collaborators: {
        Row: {
          added_at: string
          added_by: string | null
          flow_id: string
          id: string
          role: string
          user_id: string
        }
        Insert: {
          added_at?: string
          added_by?: string | null
          flow_id: string
          id?: string
          role?: string
          user_id: string
        }
        Update: {
          added_at?: string
          added_by?: string | null
          flow_id?: string
          id?: string
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "flow_collaborators_flow_id_fkey"
            columns: ["flow_id"]
            isOneToOne: false
            referencedRelation: "flows"
            referencedColumns: ["id"]
          },
        ]
      }
      flow_templates: {
        Row: {
          created_at: string
          description: string
          edges: Json
          id: string
          nodes: Json
          prompt_hint: string
          slug: string
          tags: string[]
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string
          edges?: Json
          id?: string
          nodes?: Json
          prompt_hint?: string
          slug: string
          tags?: string[]
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string
          edges?: Json
          id?: string
          nodes?: Json
          prompt_hint?: string
          slug?: string
          tags?: string[]
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      flows: {
        Row: {
          created_at: string
          edges: Json
          id: string
          is_public: boolean
          name: string
          nodes: Json
          public_role: string
          public_token: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          edges?: Json
          id?: string
          is_public?: boolean
          name?: string
          nodes?: Json
          public_role?: string
          public_token?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          edges?: Json
          id?: string
          is_public?: boolean
          name?: string
          nodes?: Json
          public_role?: string
          public_token?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          body: string
          created_at: string
          id: string
          read: boolean
          recipient_id: string
          sender_id: string | null
          title: string
        }
        Insert: {
          body?: string
          created_at?: string
          id?: string
          read?: boolean
          recipient_id: string
          sender_id?: string | null
          title: string
        }
        Update: {
          body?: string
          created_at?: string
          id?: string
          read?: boolean
          recipient_id?: string
          sender_id?: string | null
          title?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string
          display_name: string | null
          id: string
          instagram_handle: string | null
          niche: string | null
          onboarding_completed: boolean
          phone: string | null
          plan: string
          portfolio_url: string | null
          tiktok_handle: string | null
          twitter_handle: string | null
          updated_at: string
          user_id: string
          username: string | null
          video_url_1: string | null
          video_url_2: string | null
          video_url_3: string | null
          youtube_handle: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          instagram_handle?: string | null
          niche?: string | null
          onboarding_completed?: boolean
          phone?: string | null
          plan?: string
          portfolio_url?: string | null
          tiktok_handle?: string | null
          twitter_handle?: string | null
          updated_at?: string
          user_id: string
          username?: string | null
          video_url_1?: string | null
          video_url_2?: string | null
          video_url_3?: string | null
          youtube_handle?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          instagram_handle?: string | null
          niche?: string | null
          onboarding_completed?: boolean
          phone?: string | null
          plan?: string
          portfolio_url?: string | null
          tiktok_handle?: string | null
          twitter_handle?: string | null
          updated_at?: string
          user_id?: string
          username?: string | null
          video_url_1?: string | null
          video_url_2?: string | null
          video_url_3?: string | null
          youtube_handle?: string | null
        }
        Relationships: []
      }
      prospects: {
        Row: {
          company: string | null
          created_at: string
          email: string | null
          id: string
          industry: string | null
          location: string | null
          name: string | null
          notes: string | null
          phone: string | null
          raw: Json
          role: string | null
          source_file: string | null
          tags: string[]
          updated_at: string
          website: string | null
        }
        Insert: {
          company?: string | null
          created_at?: string
          email?: string | null
          id?: string
          industry?: string | null
          location?: string | null
          name?: string | null
          notes?: string | null
          phone?: string | null
          raw?: Json
          role?: string | null
          source_file?: string | null
          tags?: string[]
          updated_at?: string
          website?: string | null
        }
        Update: {
          company?: string | null
          created_at?: string
          email?: string | null
          id?: string
          industry?: string | null
          location?: string | null
          name?: string | null
          notes?: string | null
          phone?: string | null
          raw?: Json
          role?: string | null
          source_file?: string | null
          tags?: string[]
          updated_at?: string
          website?: string | null
        }
        Relationships: []
      }
      referrals: {
        Row: {
          created_at: string
          id: string
          purchased: boolean
          purchased_at: string | null
          referred_at: string
          referred_id: string
          referrer_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          purchased?: boolean
          purchased_at?: string | null
          referred_at?: string
          referred_id: string
          referrer_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          purchased?: boolean
          purchased_at?: string | null
          referred_at?: string
          referred_id?: string
          referrer_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          cancel_at_period_end: boolean | null
          created_at: string
          current_period_end: string | null
          current_period_start: string | null
          environment: string
          id: string
          price_id: string
          product_id: string
          status: string
          stripe_customer_id: string
          stripe_subscription_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          cancel_at_period_end?: boolean | null
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          environment?: string
          id?: string
          price_id: string
          product_id: string
          status?: string
          stripe_customer_id: string
          stripe_subscription_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          cancel_at_period_end?: boolean | null
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          environment?: string
          id?: string
          price_id?: string
          product_id?: string
          status?: string
          stripe_customer_id?: string
          stripe_subscription_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      trends: {
        Row: {
          bullets: Json
          category: string
          created_at: string
          expires_at: string
          id: string
          is_active: boolean
          links: Json
          media_type: string
          media_url: string | null
          published_at: string
          source: string | null
          summary: string | null
          thumbnail_url: string | null
          title: string
          updated_at: string
        }
        Insert: {
          bullets?: Json
          category?: string
          created_at?: string
          expires_at?: string
          id?: string
          is_active?: boolean
          links?: Json
          media_type?: string
          media_url?: string | null
          published_at?: string
          source?: string | null
          summary?: string | null
          thumbnail_url?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          bullets?: Json
          category?: string
          created_at?: string
          expires_at?: string
          id?: string
          is_active?: boolean
          links?: Json
          media_type?: string
          media_url?: string | null
          published_at?: string
          source?: string | null
          summary?: string | null
          thumbnail_url?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_applications: {
        Row: {
          created_at: string
          id: string
          liked: boolean
          program_id: string
          status: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          liked?: boolean
          program_id: string
          status?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          liked?: boolean
          program_id?: string
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_applications_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "brand_programs"
            referencedColumns: ["id"]
          },
        ]
      }
      user_apps: {
        Row: {
          api_key: string | null
          builtin_key: string | null
          connector_type: string
          created_at: string
          enabled: boolean
          id: string
          is_builtin: boolean
          name: string
          updated_at: string
          url: string | null
          user_id: string
        }
        Insert: {
          api_key?: string | null
          builtin_key?: string | null
          connector_type?: string
          created_at?: string
          enabled?: boolean
          id?: string
          is_builtin?: boolean
          name: string
          updated_at?: string
          url?: string | null
          user_id: string
        }
        Update: {
          api_key?: string | null
          builtin_key?: string | null
          connector_type?: string
          created_at?: string
          enabled?: boolean
          id?: string
          is_builtin?: boolean
          name?: string
          updated_at?: string
          url?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      can_access_flow: { Args: { _flow_id: string }; Returns: boolean }
      can_edit_flow: { Args: { _flow_id: string }; Returns: boolean }
      find_user_by_email: {
        Args: { p_email: string }
        Returns: {
          avatar_url: string
          display_name: string
          user_id: string
        }[]
      }
      get_program_applicants_by_token: {
        Args: { p_token: string }
        Returns: {
          application_id: string
          applied_at: string
          avatar_url: string
          bio: string
          display_name: string
          instagram_handle: string
          liked: boolean
          niche: string
          phone: string
          portfolio_url: string
          status: string
          tiktok_handle: string
          twitter_handle: string
          user_id: string
          video_url_1: string
          video_url_2: string
          video_url_3: string
          youtube_handle: string
        }[]
      }
      get_public_flow: {
        Args: { p_token: string }
        Returns: {
          edges: Json
          id: string
          name: string
          nodes: Json
          public_role: string
          user_id: string
        }[]
      }
      get_referral_stats: {
        Args: never
        Returns: {
          total_purchased: number
          total_referrals: number
        }[]
      }
      has_active_subscription: {
        Args: { check_env?: string; user_uuid: string }
        Returns: boolean
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_flow_owner: { Args: { _flow_id: string }; Returns: boolean }
      join_flow_by_token: { Args: { p_token: string }; Returns: string }
      mark_referral_purchased: {
        Args: { p_user_id: string }
        Returns: undefined
      }
      register_referral: { Args: { p_username: string }; Returns: boolean }
      show_limit: { Args: never; Returns: number }
      show_trgm: { Args: { "": string }; Returns: string[] }
      toggle_applicant_like: {
        Args: { p_application_id: string }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "moderator", "user"],
    },
  },
} as const
