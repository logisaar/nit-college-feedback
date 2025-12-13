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
      app_settings: {
        Row: {
          created_at: string | null
          id: string
          setting_key: string
          setting_value: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          setting_key: string
          setting_value: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          setting_key?: string
          setting_value?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      faculty: {
        Row: {
          created_at: string | null
          department: string
          designation: string | null
          email: string
          id: string
          name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          department: string
          designation?: string | null
          email: string
          id?: string
          name: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          department?: string
          designation?: string | null
          email?: string
          id?: string
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      faculty_assignments: {
        Row: {
          branch: string
          created_at: string | null
          faculty_id: string
          id: string
          section: string
          semester: number
          subject: string
          year: number
        }
        Insert: {
          branch: string
          created_at?: string | null
          faculty_id: string
          id?: string
          section: string
          semester: number
          subject: string
          year: number
        }
        Update: {
          branch?: string
          created_at?: string | null
          faculty_id?: string
          id?: string
          section?: string
          semester?: number
          subject?: string
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "faculty_assignments_faculty_id_fkey"
            columns: ["faculty_id"]
            isOneToOne: false
            referencedRelation: "faculty"
            referencedColumns: ["id"]
          },
        ]
      }
      hostel_ratings: {
        Row: {
          accommodation_rooms: number
          created_at: string
          discipline_rules: number
          feedback_message: string | null
          hostel_staff_behaviour: number
          id: string
          maintenance_facilities: number
          medical_facilities: number
          mess_food_quality: number
          overall_living_experience: number
          safety_security: number
          student_id: string
          updated_at: string
          washrooms_hygiene: number
          wifi_connectivity: number
        }
        Insert: {
          accommodation_rooms: number
          created_at?: string
          discipline_rules: number
          feedback_message?: string | null
          hostel_staff_behaviour: number
          id?: string
          maintenance_facilities: number
          medical_facilities: number
          mess_food_quality: number
          overall_living_experience: number
          safety_security: number
          student_id: string
          updated_at?: string
          washrooms_hygiene: number
          wifi_connectivity: number
        }
        Update: {
          accommodation_rooms?: number
          created_at?: string
          discipline_rules?: number
          feedback_message?: string | null
          hostel_staff_behaviour?: number
          id?: string
          maintenance_facilities?: number
          medical_facilities?: number
          mess_food_quality?: number
          overall_living_experience?: number
          safety_security?: number
          student_id?: string
          updated_at?: string
          washrooms_hygiene?: number
          wifi_connectivity?: number
        }
        Relationships: []
      }
      messages: {
        Row: {
          admin_id: string
          created_at: string | null
          id: string
          message: string
          read_at: string | null
          student_id: string
        }
        Insert: {
          admin_id: string
          created_at?: string | null
          id?: string
          message: string
          read_at?: string | null
          student_id: string
        }
        Update: {
          admin_id?: string
          created_at?: string | null
          id?: string
          message?: string
          read_at?: string | null
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          branch: string
          created_at: string | null
          full_name: string
          id: string
          phone_number: string | null
          registration_number: string
          section: string
          semester: number
          updated_at: string | null
          year: number
        }
        Insert: {
          branch: string
          created_at?: string | null
          full_name: string
          id: string
          phone_number?: string | null
          registration_number: string
          section: string
          semester: number
          updated_at?: string | null
          year: number
        }
        Update: {
          branch?: string
          created_at?: string | null
          full_name?: string
          id?: string
          phone_number?: string | null
          registration_number?: string
          section?: string
          semester?: number
          updated_at?: string | null
          year?: number
        }
        Relationships: []
      }
      ratings: {
        Row: {
          application_teaching: number
          assignment_id: string
          class_decorum: number
          communication_skills: number
          concept_understanding: number
          content_depth: number
          created_at: string | null
          engagement_level: number
          faculty_id: string
          feedback_message: string | null
          id: string
          pedagogy_tools: number
          student_id: string
          teaching_aids: number
        }
        Insert: {
          application_teaching: number
          assignment_id: string
          class_decorum: number
          communication_skills: number
          concept_understanding: number
          content_depth: number
          created_at?: string | null
          engagement_level: number
          faculty_id: string
          feedback_message?: string | null
          id?: string
          pedagogy_tools: number
          student_id: string
          teaching_aids: number
        }
        Update: {
          application_teaching?: number
          assignment_id?: string
          class_decorum?: number
          communication_skills?: number
          concept_understanding?: number
          content_depth?: number
          created_at?: string | null
          engagement_level?: number
          faculty_id?: string
          feedback_message?: string | null
          id?: string
          pedagogy_tools?: number
          student_id?: string
          teaching_aids?: number
        }
        Relationships: [
          {
            foreignKeyName: "ratings_assignment_id_fkey"
            columns: ["assignment_id"]
            isOneToOne: false
            referencedRelation: "faculty_assignments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ratings_faculty_id_fkey"
            columns: ["faculty_id"]
            isOneToOne: false
            referencedRelation: "faculty"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ratings_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          admin_code: string
          created_at: string | null
          id: string
          role: string
          user_id: string
        }
        Insert: {
          admin_code: string
          created_at?: string | null
          id?: string
          role: string
          user_id: string
        }
        Update: {
          admin_code?: string
          created_at?: string | null
          id?: string
          role?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      check_is_admin: { Args: never; Returns: boolean }
      is_admin: { Args: { user_id: string }; Returns: boolean }
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
