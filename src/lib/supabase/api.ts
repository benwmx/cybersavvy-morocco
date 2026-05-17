import { supabase } from "./client";

export interface ClassRow {
  id: string;
  teacher_id: string;
  name: string;
  access_code: string;
  created_at: string;
}

export interface ResultRow {
  id: string;
  class_id: string;
  student_name: string;
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

  async createClass(name: string): Promise<ClassRow> {
    const session = await api.getSession();
    if (!session) throw new Error("Not authenticated");

    // Generate a 6-char code
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let access_code = "";
    for (let i = 0; i < 6; i++) access_code += chars[Math.floor(Math.random() * chars.length)];

    const { data, error } = await supabase
      .from("classes")
      .insert([{ 
        teacher_id: session.id, 
        name, 
        access_code 
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
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
