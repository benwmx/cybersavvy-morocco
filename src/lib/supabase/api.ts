import { supabase } from "./client";
import { Database } from "../database.types";

export type PublicTables = Database["public"]["Tables"];
export type ClassRow = PublicTables["classes"]["Row"];
export type StudentRow = PublicTables["students"]["Row"];
export type ScenarioRow = PublicTables["scenarios"]["Row"];
export type ResultRow = PublicTables["results"]["Row"];
export type CategoryRow = PublicTables["categories"]["Row"];
export type TutorialRow = PublicTables["tutorials"]["Row"];
export type TranslationRow = PublicTables["translations"]["Row"];

export const supabaseClient = supabase;

export interface TeacherSession {
  id: string;
  email: string;
}

export const api = {
  // ---- UI & TRANSLATIONS ----
  async listTranslations(): Promise<TranslationRow[]> {
    const { data, error } = await supabase
      .from("translations")
      .select("*");
    if (error) throw error;
    return data || [];
  },

  // ---- AUTH & SESSION ----
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

  async getSession(): Promise<TeacherSession | null> {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return null;
    return { id: session.user.id, email: session.user.email! };
  },

  async signOut() {
    await supabase.auth.signOut();
  },

  async updatePassword(password: string) {
    const { error } = await supabase.auth.updateUser({ password });
    if (error) throw error;
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
    if (!data) throw new Error("Class created but could not be retrieved.");
    
    return data;
  },

  async deleteClass(classId: string): Promise<void> {
    const session = await api.getSession();
    if (!session) throw new Error("Not authenticated");

    // Foreign keys handle cascading in the DB schema provided
    const { error } = await supabase
      .from("classes")
      .delete()
      .eq("id", classId)
      .eq("teacher_id", session.id);

    if (error) throw error;
  },

  // ---- STUDENTS ----
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

  async listStudentsInClass(classId: string): Promise<StudentRow[]> {
    const { data, error } = await supabase
      .from("students")
      .select("*")
      .eq("class_id", classId)
      .order("name_fr", { ascending: true });
    
    if (error) throw error;
    return data || [];
  },

  async addStudent(student: PublicTables["students"]["Insert"]): Promise<StudentRow> {
    const { data, error } = await supabase
      .from("students")
      .insert([student])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async removeStudent(studentId: string): Promise<void> {
    const { error } = await supabase
      .from("students")
      .delete()
      .eq("id", studentId);
    
    if (error) throw error;
  },

  // ---- SCENARIOS, CATEGORIES & TUTORIALS ----
  async listCategories(): Promise<CategoryRow[]> {
    const { data, error } = await supabase
      .from("categories")
      .select("*");
    if (error) throw error;
    return data || [];
  },

  async listTutorials(categoryId?: string): Promise<TutorialRow[]> {
    let query = supabase.from("tutorials").select("*");
    if (categoryId) query = query.eq("category_id", categoryId);
    
    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  },

  async listScenarios(): Promise<ScenarioRow[]> {
    const session = await api.getSession();
    const query = supabase.from("scenarios").select("*");
    
    if (session) {
      query.or(`teacher_id.is.null,teacher_id.eq.${session.id}`);
    } else {
      query.is("teacher_id", null);
    }

    const { data, error } = await query.order("created_at", { ascending: false });
    if (error) throw error;
    return data || [];
  },

  async listVisibleScenarios(classId: string): Promise<ScenarioRow[]> {
    const { data, error } = await supabase
      .from("class_scenario_status")
      .select("scenarios (*)")
      .eq("class_id", classId)
      .eq("is_visible", true);
    
    if (error) throw error;
    return (data || []).map((d: any) => d.scenarios) as unknown as ScenarioRow[];
  },

  async createScenario(scenario: PublicTables["scenarios"]["Insert"]): Promise<ScenarioRow> {
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
  async insertResult(payload: PublicTables["results"]["Insert"]): Promise<ResultRow> {
    const { data, error } = await supabase
      .from("results")
      .insert([payload])
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async listResultsForStudent(studentId: string): Promise<ResultRow[]> {
    const { data, error } = await supabase
      .from("results")
      .select("*")
      .eq("student_id", studentId)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data || [];
  },

  async listResultsWithStudents(classId: string): Promise<(ResultRow & { students: StudentRow })[]> {
    const { data, error } = await supabase
      .from("results")
      .select("*, students (*)")
      .eq("class_id", classId);
    if (error) throw error;
    return data as any;
  },

  async listResultsForTeacher(): Promise<ResultRow[]> {
    const session = await api.getSession();
    if (!session) return [];

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
};
