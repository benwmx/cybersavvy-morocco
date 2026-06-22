export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      translations: {
        Row: {
          key: string
          fr: string
          ar: string
        }
        Insert: {
          key: string
          fr: string
          ar: string
        }
        Update: {
          key?: string
          fr?: string
          ar?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          id: string
          first_name: string | null
          last_name: string | null
          updated_at: string | null
        }
        Insert: {
          id: string
          first_name?: string | null
          last_name?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          first_name?: string | null
          last_name?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      categories: {
        Row: {
          id: string
          teacher_id: string | null
          name: Json
          color_code: string | null
          icon: string | null
          source_category_id: string | null
        }
        Insert: {
          id?: string
          teacher_id?: string | null
          name: Json
          color_code?: string | null
          icon?: string | null
          source_category_id?: string | null
        }
        Update: {
          id?: string
          teacher_id?: string | null
          name?: Json
          color_code?: string | null
          icon?: string | null
          source_category_id?: string | null
        }
        Relationships: []
      }
      classes: {
        Row: {
          id: string
          teacher_id: string
          name: string
          access_code: string
          created_at: string
        }
        Insert: {
          id?: string
          teacher_id: string
          name: string
          access_code: string
          created_at?: string
        }
        Update: {
          id?: string
          teacher_id?: string
          name?: string
          access_code?: string
          created_at?: string
        }
        Relationships: []
      }
      scenarios: {
        Row: {
          id: string
          teacher_id: string | null
          category_id: string
          title: Json
          description: Json
          questions: Json
          icon: string | null
          color: string | null
          image_url: string | null
          is_public: boolean
          sort_order: number
          created_at: string
        }
        Insert: {
          id?: string
          teacher_id?: string | null
          category_id: string
          title: Json
          description: Json
          questions: Json
          icon?: string | null
          color?: string | null
          image_url?: string | null
          is_public?: boolean
          sort_order?: number
          created_at?: string
        }
        Update: {
          id?: string
          teacher_id?: string | null
          category_id?: string
          title?: Json
          description?: Json
          questions?: Json
          icon?: string | null
          color?: string | null
          image_url?: string | null
          is_public?: boolean
          sort_order?: number
          created_at?: string
        }
        Relationships: []
      }
      tutorials: {
        Row: {
          id: string
          teacher_id: string | null
          category_id: string
          title: Json
          content: Json
          image_url: string | null
          created_at: string
        }
        Insert: {
          id?: string
          teacher_id?: string | null
          category_id: string
          title: Json
          content: Json
          image_url?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          teacher_id?: string | null
          category_id?: string
          title?: Json
          content?: Json
          image_url?: string | null
          created_at?: string
        }
        Relationships: []
      }
      class_categories: {
        Row: {
          class_id: string
          category_id: string
        }
        Insert: {
          class_id: string
          category_id: string
        }
        Update: {
          class_id?: string
          category_id?: string
        }
        Relationships: []
      }
      class_scenario_status: {
        Row: {
          class_id: string
          scenario_id: string
          is_visible: boolean
        }
        Insert: {
          class_id: string
          scenario_id: string
          is_visible?: boolean
        }
        Update: {
          class_id?: string
          scenario_id?: string
          is_visible?: boolean
        }
        Relationships: []
      }
      students: {
        Row: {
          id: string
          class_id: string
          massar_code: string
          name_fr: string
          name_ar: string
        }
        Insert: {
          id?: string
          class_id: string
          massar_code: string
          name_fr: string
          name_ar: string
        }
        Update: {
          id?: string
          class_id?: string
          massar_code?: string
          name_fr?: string
          name_ar?: string
        }
        Relationships: []
      }
      doc_sections: {
        Row: {
          id: string
          key: string
          label_fr: string
          label_ar: string
          sort_order: number
          created_at: string
        }
        Insert: {
          id?: string
          key: string
          label_fr: string
          label_ar: string
          sort_order?: number
          created_at?: string
        }
        Update: {
          id?: string
          key?: string
          label_fr?: string
          label_ar?: string
          sort_order?: number
          created_at?: string
        }
        Relationships: []
      }
      doc_articles: {
        Row: {
          id: string
          section_key: string
          section_label: Json
          title: Json
          content: Json
          sort_order: number
          is_published: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          section_key: string
          section_label: Json
          title: Json
          content: Json
          sort_order?: number
          is_published?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          section_key?: string
          section_label?: Json
          title?: Json
          content?: Json
          sort_order?: number
          is_published?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      recommendations: {
        Row: {
          id: string
          teacher_id: string
          class_id: string | null
          class_name: string | null
          content: string
          created_at: string
        }
        Insert: {
          id?: string
          teacher_id: string
          class_id?: string | null
          class_name?: string | null
          content: string
          created_at?: string
        }
        Update: {
          id?: string
          teacher_id?: string
          class_id?: string | null
          class_name?: string | null
          content?: string
          created_at?: string
        }
        Relationships: []
      }
      results: {
        Row: {
          id: string
          student_id: string
          class_id: string
          scenario_id: string
          score: number
          max_score: number
          mistakes: string[] | null
          created_at: string
        }
        Insert: {
          id?: string
          student_id: string
          class_id: string
          scenario_id: string
          score: number
          max_score: number
          mistakes?: string[] | null
          created_at?: string
        }
        Update: {
          id?: string
          student_id?: string
          class_id?: string
          scenario_id?: string
          score?: number
          max_score?: number
          mistakes?: string[] | null
          created_at?: string
        }
        Relationships: []
      }
      app_settings: {
        Row: {
          key: string
          value: Json
          updated_at: string
        }
        Insert: {
          key: string
          value: Json
          updated_at?: string
        }
        Update: {
          key?: string
          value?: Json
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_class_visible_scenarios: {
        Args: { p_class_id: string }
        Returns: {
          id: string
          teacher_id: string | null
          category_id: string
          title: Json
          description: Json
          questions: Json
          icon: string | null
          color: string | null
          image_url: string | null
          is_public: boolean
          created_at: string
        }[]
      }
      admin_list_users: {
        Args: Record<string, never>
        Returns: {
          id: string
          email: string
          created_at: string
          class_count: number
          student_count: number
        }[]
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
