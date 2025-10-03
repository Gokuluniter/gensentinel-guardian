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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      activity_logs: {
        Row: {
          activity_type: Database["public"]["Enums"]["activity_type"]
          created_at: string
          description: string
          id: string
          ip_address: unknown | null
          metadata: Json | null
          organization_id: string | null
          resource_id: string | null
          resource_type: string | null
          user_agent: string | null
          user_id: string
        }
        Insert: {
          activity_type: Database["public"]["Enums"]["activity_type"]
          created_at?: string
          description: string
          id?: string
          ip_address?: unknown | null
          metadata?: Json | null
          organization_id?: string | null
          resource_id?: string | null
          resource_type?: string | null
          user_agent?: string | null
          user_id: string
        }
        Update: {
          activity_type?: Database["public"]["Enums"]["activity_type"]
          created_at?: string
          description?: string
          id?: string
          ip_address?: unknown | null
          metadata?: Json | null
          organization_id?: string | null
          resource_id?: string | null
          resource_type?: string | null
          user_agent?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "activity_logs_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activity_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      calendar_events: {
        Row: {
          attendees: string[] | null
          created_at: string
          created_by: string
          description: string | null
          end_date: string | null
          event_type: string
          id: string
          location: string | null
          organization_id: string | null
          start_date: string
          title: string
          updated_at: string
        }
        Insert: {
          attendees?: string[] | null
          created_at?: string
          created_by: string
          description?: string | null
          end_date?: string | null
          event_type: string
          id?: string
          location?: string | null
          organization_id?: string | null
          start_date: string
          title: string
          updated_at?: string
        }
        Update: {
          attendees?: string[] | null
          created_at?: string
          created_by?: string
          description?: string | null
          end_date?: string | null
          event_type?: string
          id?: string
          location?: string | null
          organization_id?: string | null
          start_date?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "calendar_events_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      contact_leads: {
        Row: {
          company_name: string
          contact_person: string
          created_at: string
          email: string
          id: string
          phone: string | null
          requirements: string | null
          status: string | null
        }
        Insert: {
          company_name: string
          contact_person: string
          created_at?: string
          email: string
          id?: string
          phone?: string | null
          requirements?: string | null
          status?: string | null
        }
        Update: {
          company_name?: string
          contact_person?: string
          created_at?: string
          email?: string
          id?: string
          phone?: string | null
          requirements?: string | null
          status?: string | null
        }
        Relationships: []
      }
      departments: {
        Row: {
          created_at: string
          description: string | null
          head_id: string | null
          id: string
          name: Database["public"]["Enums"]["department"]
        }
        Insert: {
          created_at?: string
          description?: string | null
          head_id?: string | null
          id?: string
          name: Database["public"]["Enums"]["department"]
        }
        Update: {
          created_at?: string
          description?: string | null
          head_id?: string | null
          id?: string
          name?: Database["public"]["Enums"]["department"]
        }
        Relationships: [
          {
            foreignKeyName: "departments_head_id_fkey"
            columns: ["head_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      documents: {
        Row: {
          created_at: string
          department: Database["public"]["Enums"]["department"]
          description: string | null
          file_path: string | null
          file_size: number | null
          file_type: string | null
          id: string
          is_confidential: boolean | null
          organization_id: string | null
          project_id: string | null
          security_level: number | null
          title: string
          updated_at: string
          uploaded_by: string
        }
        Insert: {
          created_at?: string
          department: Database["public"]["Enums"]["department"]
          description?: string | null
          file_path?: string | null
          file_size?: number | null
          file_type?: string | null
          id?: string
          is_confidential?: boolean | null
          organization_id?: string | null
          project_id?: string | null
          security_level?: number | null
          title: string
          updated_at?: string
          uploaded_by: string
        }
        Update: {
          created_at?: string
          department?: Database["public"]["Enums"]["department"]
          description?: string | null
          file_path?: string | null
          file_size?: number | null
          file_type?: string | null
          id?: string
          is_confidential?: boolean | null
          organization_id?: string | null
          project_id?: string | null
          security_level?: number | null
          title?: string
          updated_at?: string
          uploaded_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "documents_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          company_size: string | null
          created_at: string
          id: string
          industry: string | null
          is_active: boolean | null
          name: string
          primary_contact_email: string
          primary_contact_name: string
          primary_contact_phone: string | null
          updated_at: string
        }
        Insert: {
          company_size?: string | null
          created_at?: string
          id?: string
          industry?: string | null
          is_active?: boolean | null
          name: string
          primary_contact_email: string
          primary_contact_name: string
          primary_contact_phone?: string | null
          updated_at?: string
        }
        Update: {
          company_size?: string | null
          created_at?: string
          id?: string
          industry?: string | null
          is_active?: boolean | null
          name?: string
          primary_contact_email?: string
          primary_contact_name?: string
          primary_contact_phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          department: Database["public"]["Enums"]["department"]
          email: string
          employee_id: string
          first_name: string
          id: string
          is_active: boolean | null
          last_login: string | null
          last_name: string
          last_score_update: string | null
          manager_id: string | null
          organization_id: string | null
          phone: string | null
          position: string | null
          role: Database["public"]["Enums"]["user_role"] | null
          security_clearance: number | null
          security_score: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          department: Database["public"]["Enums"]["department"]
          email: string
          employee_id: string
          first_name: string
          id?: string
          is_active?: boolean | null
          last_login?: string | null
          last_name: string
          last_score_update?: string | null
          manager_id?: string | null
          organization_id?: string | null
          phone?: string | null
          position?: string | null
          role?: Database["public"]["Enums"]["user_role"] | null
          security_clearance?: number | null
          security_score?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          department?: Database["public"]["Enums"]["department"]
          email?: string
          employee_id?: string
          first_name?: string
          id?: string
          is_active?: boolean | null
          last_login?: string | null
          last_name?: string
          last_score_update?: string | null
          manager_id?: string | null
          organization_id?: string | null
          phone?: string | null
          position?: string | null
          role?: Database["public"]["Enums"]["user_role"] | null
          security_clearance?: number | null
          security_score?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_manager_id_fkey"
            columns: ["manager_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          created_at: string
          department: Database["public"]["Enums"]["department"]
          description: string | null
          end_date: string | null
          id: string
          manager_id: string | null
          name: string
          organization_id: string | null
          start_date: string | null
          status: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          department: Database["public"]["Enums"]["department"]
          description?: string | null
          end_date?: string | null
          id?: string
          manager_id?: string | null
          name: string
          organization_id?: string | null
          start_date?: string | null
          status?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          department?: Database["public"]["Enums"]["department"]
          description?: string | null
          end_date?: string | null
          id?: string
          manager_id?: string | null
          name?: string
          organization_id?: string | null
          start_date?: string | null
          status?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "projects_manager_id_fkey"
            columns: ["manager_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projects_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      security_notifications: {
        Row: {
          created_at: string
          id: string
          is_read: boolean | null
          message: string
          profile_id: string
          severity: string
          title: string
          xai_explanation: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          is_read?: boolean | null
          message: string
          profile_id: string
          severity: string
          title: string
          xai_explanation?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          is_read?: boolean | null
          message?: string
          profile_id?: string
          severity?: string
          title?: string
          xai_explanation?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_profile"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      security_score_history: {
        Row: {
          created_at: string
          id: string
          previous_score: number | null
          profile_id: string
          reason: string | null
          score: number
        }
        Insert: {
          created_at?: string
          id?: string
          previous_score?: number | null
          profile_id: string
          reason?: string | null
          score: number
        }
        Update: {
          created_at?: string
          id?: string
          previous_score?: number | null
          profile_id?: string
          reason?: string | null
          score?: number
        }
        Relationships: [
          {
            foreignKeyName: "fk_profile"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      system_settings: {
        Row: {
          description: string | null
          id: string
          key: string
          updated_at: string
          updated_by: string | null
          value: Json
        }
        Insert: {
          description?: string | null
          id?: string
          key: string
          updated_at?: string
          updated_by?: string | null
          value: Json
        }
        Update: {
          description?: string | null
          id?: string
          key?: string
          updated_at?: string
          updated_by?: string | null
          value?: Json
        }
        Relationships: [
          {
            foreignKeyName: "system_settings_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      threat_detections: {
        Row: {
          activity_log_id: string | null
          ai_explanation: string
          created_at: string
          description: string
          id: string
          is_resolved: boolean | null
          organization_id: string | null
          resolution_notes: string | null
          resolved_at: string | null
          resolved_by: string | null
          risk_score: number | null
          threat_level: Database["public"]["Enums"]["threat_level"]
          threat_type: string
          user_id: string
        }
        Insert: {
          activity_log_id?: string | null
          ai_explanation: string
          created_at?: string
          description: string
          id?: string
          is_resolved?: boolean | null
          organization_id?: string | null
          resolution_notes?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          risk_score?: number | null
          threat_level: Database["public"]["Enums"]["threat_level"]
          threat_type: string
          user_id: string
        }
        Update: {
          activity_log_id?: string | null
          ai_explanation?: string
          created_at?: string
          description?: string
          id?: string
          is_resolved?: boolean | null
          organization_id?: string | null
          resolution_notes?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          risk_score?: number | null
          threat_level?: Database["public"]["Enums"]["threat_level"]
          threat_type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "threat_detections_activity_log_id_fkey"
            columns: ["activity_log_id"]
            isOneToOne: false
            referencedRelation: "activity_logs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "threat_detections_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "threat_detections_resolved_by_fkey"
            columns: ["resolved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "threat_detections_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_permissions: {
        Row: {
          created_at: string
          expires_at: string | null
          granted_by: string | null
          id: string
          permission_type: string
          resource_id: string | null
          resource_type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          expires_at?: string | null
          granted_by?: string | null
          id?: string
          permission_type: string
          resource_id?: string | null
          resource_type: string
          user_id: string
        }
        Update: {
          created_at?: string
          expires_at?: string | null
          granted_by?: string | null
          id?: string
          permission_type?: string
          resource_id?: string | null
          resource_type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_permissions_granted_by_fkey"
            columns: ["granted_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_permissions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_current_user_department: {
        Args: Record<PropertyKey, never>
        Returns: Database["public"]["Enums"]["department"]
      }
      get_current_user_organization: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_current_user_profile_id: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_current_user_role: {
        Args: Record<PropertyKey, never>
        Returns: Database["public"]["Enums"]["user_role"]
      }
      get_current_user_security_clearance: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      log_activity: {
        Args: {
          p_activity_type: Database["public"]["Enums"]["activity_type"]
          p_description: string
          p_metadata?: Json
          p_resource_id?: string
          p_resource_type?: string
          p_user_id: string
        }
        Returns: string
      }
    }
    Enums: {
      activity_type:
        | "login"
        | "logout"
        | "file_access"
        | "file_download"
        | "file_upload"
        | "document_view"
        | "report_generate"
        | "user_management"
        | "system_config"
        | "data_export"
      department:
        | "hr"
        | "finance"
        | "it"
        | "operations"
        | "legal"
        | "marketing"
        | "security"
      threat_level: "low" | "medium" | "high" | "critical"
      user_role:
        | "user"
        | "supervisor"
        | "department_head"
        | "security_officer"
        | "admin"
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
      activity_type: [
        "login",
        "logout",
        "file_access",
        "file_download",
        "file_upload",
        "document_view",
        "report_generate",
        "user_management",
        "system_config",
        "data_export",
      ],
      department: [
        "hr",
        "finance",
        "it",
        "operations",
        "legal",
        "marketing",
        "security",
      ],
      threat_level: ["low", "medium", "high", "critical"],
      user_role: [
        "user",
        "supervisor",
        "department_head",
        "security_officer",
        "admin",
      ],
    },
  },
} as const
