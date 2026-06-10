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
  isAdmin: boolean;
}

export const api = {
  // ---- UI & TRANSLATIONS ----
  async listTranslations(): Promise<TranslationRow[]> {
    const { data, error } = await supabase
      .from("translations")
      .select("*")
      .order("key", { ascending: true });
    if (error) throw error;
    return data || [];
  },

  async upsertTranslation(key: string, fr: string, ar: string): Promise<TranslationRow> {
    const { data, error } = await supabase
      .from("translations")
      .upsert({ key, fr, ar }, { onConflict: "key" })
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async deleteTranslation(key: string): Promise<void> {
    const { error } = await supabase
      .from("translations")
      .delete()
      .eq("key", key);
    if (error) throw error;
  },

  // ---- AUTH & SESSION ----
  async signUp(email: string, password: string): Promise<TeacherSession> {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) throw error;
    if (!data.user) throw new Error("No user returned");
    return { id: data.user.id, email: data.user.email!, isAdmin: data.user.app_metadata?.is_admin === true };
  },

  async signIn(email: string, password: string): Promise<TeacherSession> {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    if (!data.user) throw new Error("No user returned");
    return { id: data.user.id, email: data.user.email!, isAdmin: data.user.app_metadata?.is_admin === true };
  },

  async getSession(): Promise<TeacherSession | null> {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return null;
    return { id: session.user.id, email: session.user.email!, isAdmin: session.user.app_metadata?.is_admin === true };
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
    const { data, error } = await supabase.from("categories").select("*");
    if (error) throw error;
    return data || [];
  },

  async createCategory(data: PublicTables["categories"]["Insert"]): Promise<CategoryRow> {
    const { data: created, error } = await supabase
      .from("categories")
      .insert([data])
      .select()
      .single();
    if (error) throw error;
    return created;
  },

  async updateCategory(id: string, data: PublicTables["categories"]["Update"]): Promise<CategoryRow> {
    const { data: updated, error } = await supabase
      .from("categories")
      .update(data)
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return updated;
  },

  async deleteCategory(id: string): Promise<void> {
    const { error } = await supabase.from("categories").delete().eq("id", id);
    if (error) throw error;
  },

  async forkCategory(globalCategoryId: string): Promise<CategoryRow> {
    const session = await api.getSession();
    if (!session) throw new Error("Not authenticated");

    // Fetch global category
    const { data: global, error: catErr } = await supabase
      .from("categories")
      .select("*")
      .eq("id", globalCategoryId)
      .single();
    if (catErr || !global) throw catErr ?? new Error("Category not found");

    // Create private fork
    const { data: fork, error: forkErr } = await supabase
      .from("categories")
      .insert([{
        teacher_id: session.id,
        name: global.name,
        color_code: global.color_code,
        source_category_id: globalCategoryId,
      }])
      .select()
      .single();
    if (forkErr || !fork) throw forkErr ?? new Error("Fork creation failed");

    // Copy global scenarios into the fork
    const { data: globalScenarios } = await supabase
      .from("scenarios")
      .select("*")
      .eq("category_id", globalCategoryId)
      .is("teacher_id", null);

    if (globalScenarios?.length) {
      const copies = globalScenarios.map(s => ({
        teacher_id: session.id,
        category_id: fork.id,
        title: s.title,
        description: s.description,
        questions: s.questions,
        icon: s.icon,
        color: s.color,
        is_public: false,
      }));
      await supabase.from("scenarios").insert(copies);
    }

    return fork;
  },

  async resetCategoryToDefault(privateCategoryId: string): Promise<void> {
    const session = await api.getSession();
    if (!session) throw new Error("Not authenticated");

    // Get the source global category id
    const { data: privatecat, error: catErr } = await supabase
      .from("categories")
      .select("source_category_id")
      .eq("id", privateCategoryId)
      .single();
    if (catErr || !privatecat?.source_category_id) throw new Error("No source category to reset from");

    const sourceId = privatecat.source_category_id;

    // Delete all teacher-owned scenarios in this category
    await supabase
      .from("scenarios")
      .delete()
      .eq("category_id", privateCategoryId)
      .eq("teacher_id", session.id);

    // Re-copy global scenarios
    const { data: globalScenarios } = await supabase
      .from("scenarios")
      .select("*")
      .eq("category_id", sourceId)
      .is("teacher_id", null);

    if (globalScenarios?.length) {
      const copies = globalScenarios.map(s => ({
        teacher_id: session.id,
        category_id: privateCategoryId,
        title: s.title,
        description: s.description,
        questions: s.questions,
        icon: s.icon,
        color: s.color,
        is_public: false,
      }));
      await supabase.from("scenarios").insert(copies);
    }
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
    let query = supabase.from("scenarios").select("*");

    if (session) {
      query = query.or(`teacher_id.is.null,teacher_id.eq.${session.id}`);
    } else {
      query = query.is("teacher_id", null);
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

  async updateScenario(id: string, data: PublicTables["scenarios"]["Update"]): Promise<ScenarioRow> {
    const { data: updated, error } = await supabase
      .from("scenarios")
      .update(data)
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return updated;
  },

  async deleteScenario(id: string): Promise<void> {
    const { error } = await supabase.from("scenarios").delete().eq("id", id);
    if (error) throw error;
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

  // ---- ADMIN ----
  async adminGetStats(): Promise<{
    total_teachers: number;
    total_classes: number;
    total_students: number;
    total_results: number;
    avg_score_percent: number | null;
  }> {
    const [classesResult, studentsResult, resultsResult] = await Promise.all([
      supabase.from("classes").select("teacher_id"),
      supabase.from("students").select("id", { count: "exact", head: true }),
      supabase.from("results").select("score, max_score"),
    ]);

    const classes = classesResult.data || [];
    const results = resultsResult.data || [];
    const uniqueTeachers = new Set(classes.map(c => c.teacher_id)).size;
    const scored = results.filter(r => r.max_score > 0);
    const avgScore = scored.length > 0
      ? Math.round(scored.reduce((sum, r) => sum + (r.score / r.max_score * 100), 0) / scored.length)
      : null;

    return {
      total_teachers: uniqueTeachers,
      total_classes: classes.length,
      total_students: studentsResult.count ?? 0,
      total_results: results.length,
      avg_score_percent: avgScore,
    };
  },

  async adminListUsers(): Promise<{ id: string; email: string; created_at: string; class_count: number; student_count: number }[]> {
    const { data, error } = await supabase.rpc("admin_list_users");
    if (error) throw error;
    return (data || []) as { id: string; email: string; created_at: string; class_count: number; student_count: number }[];
  },

  async adminListAllClasses(): Promise<{
    id: string;
    name: string;
    access_code: string;
    teacher_id: string;
    teacher_email: string;
    student_count: number;
    scenario_count: number;
    created_at: string;
  }[]> {
    const { data, error } = await supabase.rpc("admin_list_classes");
    if (error) throw error;
    return (data || []) as {
      id: string;
      name: string;
      access_code: string;
      teacher_id: string;
      teacher_email: string;
      student_count: number;
      scenario_count: number;
      created_at: string;
    }[];
  },

  async adminListGlobalCategories(): Promise<CategoryRow[]> {
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .is("teacher_id", null)
      .order("id");
    if (error) throw error;
    return data || [];
  },

  async adminListGlobalScenarios(categoryId?: string): Promise<ScenarioRow[]> {
    let query = supabase.from("scenarios").select("*").is("teacher_id", null);
    if (categoryId) query = query.eq("category_id", categoryId);
    const { data, error } = await query.order("created_at", { ascending: false });
    if (error) throw error;
    return data || [];
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
