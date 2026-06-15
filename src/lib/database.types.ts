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
      }
      categories: {
        Row: {
          id: string
          teacher_id: string | null
          name: Json
          color_code: string | null
          source_category_id: string | null
        }
        Insert: {
          id?: string
          teacher_id?: string | null
          name: Json
          color_code?: string | null
          source_category_id?: string | null
        }
        Update: {
          id?: string
          teacher_id?: string | null
          name?: Json
          color_code?: string | null
          source_category_id?: string | null
        }
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
          created_at?: string
        }
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
      }
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
  }
}
