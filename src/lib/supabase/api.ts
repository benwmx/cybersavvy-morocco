import { supabase } from "./client";
import { Database } from "../database.types";
import { getDB } from "@/lib/offline/db";

export type PublicTables = Database["public"]["Tables"];
export type ClassRow = PublicTables["classes"]["Row"];
export type StudentRow = PublicTables["students"]["Row"];
export type ScenarioRow = PublicTables["scenarios"]["Row"];
export type ResultRow = PublicTables["results"]["Row"];
export type CategoryRow = PublicTables["categories"]["Row"];
export type TutorialRow = PublicTables["tutorials"]["Row"];
export type TranslationRow = PublicTables["translations"]["Row"];
export type RecommendationRow = PublicTables["recommendations"]["Row"];
export type DocArticleRow = PublicTables["doc_articles"]["Row"];

export const supabaseClient = supabase;

export interface TeacherSession {
  id: string;
  email: string;
  isAdmin: boolean;
  firstName: string;
  lastName: string;
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
  async signUp(email: string, password: string, firstName: string, lastName: string): Promise<TeacherSession> {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { first_name: firstName.trim(), last_name: lastName.trim() } },
    });
    if (error) throw error;
    if (!data.user) throw new Error("No user returned");
    return {
      id: data.user.id,
      email: data.user.email!,
      isAdmin: data.user.app_metadata?.is_admin === true,
      firstName: data.user.user_metadata?.first_name ?? "",
      lastName: data.user.user_metadata?.last_name ?? "",
    };
  },

  async signIn(email: string, password: string): Promise<TeacherSession> {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    if (!data.user) throw new Error("No user returned");
    return {
      id: data.user.id,
      email: data.user.email!,
      isAdmin: data.user.app_metadata?.is_admin === true,
      firstName: data.user.user_metadata?.first_name ?? "",
      lastName: data.user.user_metadata?.last_name ?? "",
    };
  },

  async getSession(): Promise<TeacherSession | null> {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return null;
    return {
      id: session.user.id,
      email: session.user.email!,
      isAdmin: session.user.app_metadata?.is_admin === true,
      firstName: session.user.user_metadata?.first_name ?? "",
      lastName: session.user.user_metadata?.last_name ?? "",
    };
  },

  async signOut() {
    await supabase.auth.signOut();
  },

  async sendPasswordReset(email: string) {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) throw error;
  },

  async updatePassword(password: string) {
    const { error } = await supabase.auth.updateUser({ password });
    if (error) throw error;
  },

  async updateEmail(email: string) {
    const { error } = await supabase.auth.updateUser({ email });
    if (error) throw error;
  },

  async updateProfile(firstName: string, lastName: string) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");
    const { error: authError } = await supabase.auth.updateUser({
      data: { first_name: firstName.trim(), last_name: lastName.trim() },
    });
    if (authError) throw authError;
    const { error: dbError } = await supabase
      .from("profiles")
      .update({ first_name: firstName.trim(), last_name: lastName.trim(), updated_at: new Date().toISOString() })
      .eq("id", user.id);
    if (dbError) throw dbError;
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
    const { data, error } = await supabase.rpc("admin_get_stats");
    if (error) throw error;
    const row = (data as any[])?.[0] ?? {};
    return {
      total_teachers: Number(row.total_teachers ?? 0),
      total_classes:  Number(row.total_classes  ?? 0),
      total_students: Number(row.total_students ?? 0),
      total_results:  Number(row.total_results  ?? 0),
      avg_score_percent: row.avg_score_percent != null ? Number(row.avg_score_percent) : null,
    };
  },

  async adminListUsers(): Promise<{ id: string; email: string; first_name: string; last_name: string; created_at: string; class_count: number; student_count: number }[]> {
    const { data, error } = await supabase.rpc("admin_list_users");
    if (error) throw error;
    return (data || []) as { id: string; email: string; first_name: string; last_name: string; created_at: string; class_count: number; student_count: number }[];
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
    const { data, error } = await supabase.rpc("admin_list_global_categories");
    if (error) throw error;
    return (data || []) as CategoryRow[];
  },

  async adminListGlobalScenarios(categoryId?: string): Promise<ScenarioRow[]> {
    const { data, error } = await supabase.rpc("admin_list_global_scenarios", {
      p_category_id: categoryId ?? null,
    });
    if (error) throw error;
    return (data || []) as ScenarioRow[];
  },

  async adminUpdateScenarioQuestions(id: string, questions: Json): Promise<void> {
    const { error } = await supabase.rpc("admin_update_scenario_questions", {
      p_id: id,
      p_questions: questions,
    });
    if (error) throw error;
  },

  async adminSaveScenario(
    id: string | null,
    categoryId: string,
    title: Json,
    description: Json,
    questions: Json,
    imageUrl?: string | null,
  ): Promise<string> {
    const { data, error } = await supabase.rpc("admin_save_scenario", {
      p_id: id,
      p_category_id: categoryId,
      p_title: title,
      p_description: description,
      p_questions: questions,
      p_image_url: imageUrl ?? null,
    });
    if (error) throw error;
    return data as string;
  },

  async adminSaveCategory(id: string | null, name: Json, colorCode: string): Promise<string> {
    const { data, error } = await supabase.rpc("admin_save_category", {
      p_id: id,
      p_name: name,
      p_color_code: colorCode,
    });
    if (error) throw error;
    return data as string;
  },

  async adminDeleteCategory(id: string): Promise<void> {
    const { error } = await supabase.rpc("admin_delete_category", { p_id: id });
    if (error) throw error;
  },

  // ---- STORAGE ----
  getMediaUrl(path: string): string {
    const { data } = supabase.storage.from("cybersafe-media").getPublicUrl(path);
    return data.publicUrl;
  },

  async uploadMedia(userId: string, folder: string, file: File): Promise<string> {
    const ext = file.name.split(".").pop();
    const path = `${userId}/${folder}/${crypto.randomUUID()}.${ext}`;
    const { error } = await supabase.storage
      .from("cybersafe-media")
      .upload(path, file, { upsert: false });
    if (error) throw error;
    return path;
  },

  async deleteMedia(path: string): Promise<void> {
    const { error } = await supabase.storage
      .from("cybersafe-media")
      .remove([path]);
    if (error) throw error;
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

  async listDocArticles(): Promise<DocArticleRow[]> {
    if (navigator.onLine) {
      const { data, error } = await supabase
        .from("doc_articles")
        .select("*")
        .eq("is_published", true)
        .order("section_key")
        .order("sort_order");
      if (error) throw error;
      const rows = (data ?? []) as DocArticleRow[];
      const db = getDB();
      if (db && rows.length) db.doc_articles.bulkPut(rows).catch(() => {});
      return rows;
    }
    const db = getDB();
    if (db) {
      const cached = await db.doc_articles.filter(a => a.is_published === true).toArray();
      return cached.sort((a, b) => {
        const sk = a.section_key.localeCompare(b.section_key);
        return sk !== 0 ? sk : a.sort_order - b.sort_order;
      });
    }
    return [];
  },

  async adminListDocArticles(): Promise<DocArticleRow[]> {
    const { data, error } = await supabase
      .from("doc_articles")
      .select("*")
      .order("section_key")
      .order("sort_order");
    if (error) throw error;
    return data ?? [];
  },

  async adminSaveDocArticle(article: Omit<DocArticleRow, "id" | "created_at" | "updated_at"> & { id?: string }): Promise<DocArticleRow> {
    const { id, ...fields } = article;
    let row: DocArticleRow;
    if (id) {
      const { data, error } = await supabase
        .from("doc_articles")
        .update({ ...fields, updated_at: new Date().toISOString() })
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      row = data as DocArticleRow;
    } else {
      const { data, error } = await supabase
        .from("doc_articles")
        .insert(fields)
        .select()
        .single();
      if (error) throw error;
      row = data as DocArticleRow;
    }
    const db = getDB();
    if (db) await db.doc_articles.put(row);
    return row;
  },

  async adminDeleteDocArticle(id: string): Promise<void> {
    const { error } = await supabase.from("doc_articles").delete().eq("id", id);
    if (error) throw error;
    const db = getDB();
    if (db) await db.doc_articles.delete(id);
  },

  async adminUpdateSortOrders(updates: { id: string; sort_order: number }[]): Promise<void> {
    await Promise.all(
      updates.map(({ id, sort_order }) =>
        supabase.from("doc_articles").update({ sort_order }).eq("id", id)
      )
    );
    const db = getDB();
    if (db) {
      await Promise.all(
        updates.map(({ id, sort_order }) =>
          db.doc_articles.where("id").equals(id).modify({ sort_order })
        )
      );
    }
  },

  async saveRecommendation(
    classId: string | null,
    className: string | null,
    content: string,
  ): Promise<void> {
    const session = await api.getSession();
    if (!session) throw new Error("Not authenticated");
    const { error } = await supabase
      .from("recommendations")
      .insert({ teacher_id: session.id, class_id: classId, class_name: className, content });
    if (error) throw error;
  },

  async getLastRecommendation(classId: string | null): Promise<RecommendationRow | null> {
    let query = supabase
      .from("recommendations")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(1);
    if (classId) {
      query = query.eq("class_id", classId);
    } else {
      query = query.is("class_id", null);
    }
    const { data, error } = await query;
    if (error) throw error;
    return data?.[0] ?? null;
  },
};
