import { supabase } from "./client";

export interface ClassRow {
  id: string;
  teacher_id: string;
  name: string;
  access_code: string;
  assigned_scenarios: string[]; // UUIDs or system IDs
  created_at: string;
}

export interface StudentRow {
  id: string;
  class_id: string;
  massar_code: string;
  name_fr: string;
  name_ar: string;
}

export interface ScenarioRow {
  id: string;
  teacher_id: string | null;
  category: string;
  title: { fr: string; ar: string };
  description: { fr: string; ar: string };
  questions: any[]; // JSONB Array
  created_at: string;
}

export interface ResultRow {
  id: string;
  class_id: string;
  massar_code: string;
  scenario_id: string;
  score: number;
  max_score: number;
  mistakes: string[];
  created_at: string;
}

export interface TeacherSession {
  id: string;
  email: string;
}

export const supabaseClient = supabase;

export const api = {
  // ---- AUTH ----
  async signUp(email: string, password: string): Promise<TeacherSession> {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) throw error;
    if (!data.user) throw new Error("No user returned");
    return { id: data.user.id, email: data.user.email! };
  },

  async signIn(email: string, password: string): Promise<TeacherSession> {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    if (!data.user) throw new Error("No user returned");
    return { id: data.user.id, email: data.user.email! };
  },

  async signOut() {
    await supabase.auth.signOut();
  },

  async getSession(): Promise<TeacherSession | null> {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return null;
    return { id: session.user.id, email: session.user.email! };
  },

  // ---- CLASSES ----
  async verifyClassCode(code: string): Promise<ClassRow | null> {
    const { data, error } = await supabase
      .from("classes")
      .select("*")
      .eq("access_code", code.toUpperCase())
      .single();
    
    if (error) return null;
    return data;
  },

  async verifyStudent(classId: string, massarCode: string): Promise<StudentRow | null> {
    const { data, error } = await supabase
      .from("students")
      .select("*")
      .eq("class_id", classId)
      .eq("massar_code", massarCode.toUpperCase())
      .single();
    
    if (error) return null;
    return data;
  },

  async createClass(name: string): Promise<ClassRow> {
    const session = await api.getSession();
    if (!session) throw new Error("Not authenticated");

    // Generate a 6-char code
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let access_code = "";
    for (let i = 0; i < 6; i++) access_code += chars[Math.floor(Math.random() * chars.length)];

    console.log("Creating class with:", { teacher_id: session.id, name, access_code });

    const { data, error } = await supabase
      .from("classes")
      .insert([{ 
        teacher_id: session.id, 
        name, 
        access_code,
        assigned_scenarios: [] 
      }])
      .select();

    if (error) {
      console.error("Supabase error creating class:", error);
      throw error;
    }
    
    if (!data || data.length === 0) {
      throw new Error("Class created but could not be retrieved. Check your RLS SELECT policies.");
    }
    
    return data[0];
  },

  async listMyClasses(): Promise<ClassRow[]> {
    const session = await api.getSession();
    if (!session) return [];

    const { data, error } = await supabase
      .from("classes")
      .select("*")
      .eq("teacher_id", session.id)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async updateClassScenarios(classId: string, scenarios: string[]): Promise<void> {
    const { error } = await supabase
      .from("classes")
      .update({ assigned_scenarios: scenarios })
      .eq("id", classId);
    if (error) throw error;
  },

  // ---- STUDENTS ----
  async listStudentsInClass(classId: string): Promise<StudentRow[]> {
    const { data, error } = await supabase
      .from("students")
      .select("*")
      .eq("class_id", classId)
      .order("name_fr", { ascending: true });
    
    if (error) throw error;
    return data || [];
  },

  async addStudent(student: Omit<StudentRow, "id">): Promise<StudentRow> {
    const { data, error } = await supabase
      .from("students")
      .insert([student])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // ---- SCENARIOS ----
  async listScenarios(): Promise<ScenarioRow[]> {
    const session = await api.getSession();
    const query = supabase.from("scenarios").select("*");
    
    if (session) {
      // Show system defaults (teacher_id IS NULL) OR teacher's own tracks
      query.or(`teacher_id.is.null,teacher_id.eq.${session.id}`);
    } else {
      // Guest/Public: only system defaults
      query.is("teacher_id", null);
    }

    const { data, error } = await query.order("created_at", { ascending: false });
    if (error) throw error;
    return data || [];
  },

  async createScenario(scenario: Omit<ScenarioRow, "id" | "created_at">): Promise<ScenarioRow> {
    const { data, error } = await supabase
      .from("scenarios")
      .insert([scenario])
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async getScenario(id: string): Promise<ScenarioRow | null> {
    const { data, error } = await supabase
      .from("scenarios")
      .select("*")
      .eq("id", id)
      .single();
    if (error) return null;
    return data;
  },

  // ---- RESULTS ----
  async insertResult(payload: Omit<ResultRow, "id" | "created_at">): Promise<ResultRow> {
    const { data, error } = await supabase
      .from("results")
      .insert([payload])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async listResultsForTeacher(): Promise<ResultRow[]> {
    const session = await api.getSession();
    if (!session) return [];

    // First get teacher's classes
    const { data: classes, error: classError } = await supabase
      .from("classes")
      .select("id")
      .eq("teacher_id", session.id);

    if (classError) throw classError;
    if (!classes || classes.length === 0) return [];

    const classIds = classes.map(c => c.id);

    const { data, error } = await supabase
      .from("results")
      .select("*")
      .in("class_id", classIds)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async updatePassword(password: string) {
    const { error } = await supabase.auth.updateUser({ password });
    if (error) throw error;
  },
};
