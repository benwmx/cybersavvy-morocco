import { getDB, type LocalClassScenarioStatus } from "./db";
import { supabase } from "@/lib/supabase/client";
import type { ScenarioRow, CategoryRow, DocArticleRow, DocSectionRow } from "@/lib/supabase/api";
import type { LocalTranslation } from "./db";

type SB = typeof supabase;

// Narrow supabase to `any` only where the generated types can't express joins or RPCs
const sb = supabase as unknown as { rpc: (fn: string, args?: unknown) => Promise<{ data: unknown; error: unknown }>; from: SB["from"] };

// Fetch all UI translations from Supabase and cache them in Dexie.
// Runs anonymously on app init — no auth required.
export async function syncTranslations(): Promise<void> {
  if (!navigator.onLine) return;
  const db = getDB();
  if (!db) return;

  const { data } = await supabase.from("translations").select("*");
  if (data?.length) await db.translations.bulkPut(data as LocalTranslation[]);
}

// Fetch all public scenarios and categories; runs anonymously on app init.
export async function syncPublicScenarios(): Promise<void> {
  if (!navigator.onLine) return;
  const db = getDB();
  if (!db) return;

  const [{ data: scenarios }, { data: categories }] = await Promise.all([
    supabase.from("scenarios").select("*").eq("is_public", true),
    supabase.from("categories").select("*"),
  ]);

  if (scenarios?.length) await db.scenarios.bulkPut(scenarios as ScenarioRow[]);
  if (categories?.length) await db.categories.bulkPut(categories as CategoryRow[]);
}

// Fetch scenarios visible to a student's class via the security-definer RPC.
// Called after a student authenticates with a class code.
export async function syncClassScenarios(classId: string): Promise<void> {
  if (!navigator.onLine) return;
  const db = getDB();
  if (!db) return;

  const { data, error } = await sb.rpc("get_class_visible_scenarios", { p_class_id: classId });
  const rows = data as ScenarioRow[] | null;

  if (error || !rows?.length) return;

  await db.scenarios.bulkPut(rows);

  const statuses: LocalClassScenarioStatus[] = rows.map(s => ({
    class_id: classId,
    scenario_id: s.id,
    is_visible: true,
  }));
  await db.class_scenario_status.bulkPut(statuses);
}

// Fetch the authenticated teacher's own scenarios plus all class assignments.
// Called when a teacher signs in (via onAuthStateChange SIGNED_IN).
export async function syncPrivateScenarios(teacherId: string): Promise<void> {
  if (!navigator.onLine) return;
  const db = getDB();
  if (!db) return;

  // Teacher's own scenarios
  const { data: ownScenarios } = await supabase
    .from("scenarios")
    .select("*")
    .eq("teacher_id", teacherId);

  if (ownScenarios?.length) await db.scenarios.bulkPut(ownScenarios as ScenarioRow[]);

  // Scenarios and visibility status for all the teacher's classes
  const { data: classRows } = await supabase
    .from("classes")
    .select("id")
    .eq("teacher_id", teacherId);

  if (!classRows?.length) return;

  // Cast to any: joined selects with relationships aren't typed without codegen
  const classIds = (classRows as Array<{ id: string }>).map(c => c.id);
  const { data: rawStatus } = await (supabase as any)
    .from("class_scenario_status")
    .select("class_id, scenario_id, is_visible, scenarios(*)")
    .in("class_id", classIds);

  const statusRows = rawStatus as Array<{
    class_id: string;
    scenario_id: string;
    is_visible: boolean;
    scenarios: ScenarioRow | null;
  }> | null;

  if (!statusRows?.length) return;

  const scenarios: ScenarioRow[] = [];
  const statuses: LocalClassScenarioStatus[] = [];

  for (const row of statusRows) {
    if (row.scenarios) scenarios.push(row.scenarios);
    statuses.push({ class_id: row.class_id, scenario_id: row.scenario_id, is_visible: row.is_visible });
  }

  if (scenarios.length) await db.scenarios.bulkPut(scenarios);
  if (statuses.length) await db.class_scenario_status.bulkPut(statuses);
}

// Fetch all doc sections and cache them in Dexie.
export async function syncDocSections(): Promise<void> {
  if (!navigator.onLine) return;
  const db = getDB();
  if (!db) return;

  const { data } = await supabase
    .from("doc_sections")
    .select("*")
    .order("sort_order");

  if (data?.length) await db.doc_sections.bulkPut(data as DocSectionRow[]);
}

// Fetch all published doc articles and cache them in Dexie.
// Runs anonymously on app init — no auth required.
export async function syncDocArticles(): Promise<void> {
  if (!navigator.onLine) return;
  const db = getDB();
  if (!db) return;

  const { data } = await supabase
    .from("doc_articles")
    .select("*")
    .eq("is_published", true)
    .order("section_key")
    .order("sort_order");

  if (data?.length) await db.doc_articles.bulkPut(data as DocArticleRow[]);
}

// Remove all private (non-public) scenarios and class-specific data on logout.
// Preserves public scenarios so the app stays usable without re-syncing.
export async function scrubPrivateData(): Promise<void> {
  const db = getDB();
  if (!db) return;

  const privateKeys = await db.scenarios
    .filter(s => !s.is_public)
    .primaryKeys();

  await Promise.all([
    db.scenarios.bulkDelete(privateKeys as string[]),
    db.class_scenario_status.clear(),
  ]);
}
