import Dexie, { type Table } from "dexie";
import type { ScenarioRow, CategoryRow } from "@/lib/supabase/api";

// Outbox item for results that need to be synced to Supabase
export interface QueuedResult {
  id?: number;
  payload: {
    student_id: string;
    class_id: string;
    scenario_id: string;
    score: number;
    max_score: number;
    mistakes: string[];
  };
  createdAt: number;
}

export interface LocalClassScenarioStatus {
  class_id: string;
  scenario_id: string;
  is_visible: boolean;
}

class CyberDB extends Dexie {
  offline_queue!: Table<QueuedResult, number>;
  scenarios!: Table<ScenarioRow, string>;
  categories!: Table<CategoryRow, string>;
  class_scenario_status!: Table<LocalClassScenarioStatus, [string, string]>;

  constructor() {
    super("cyber-safety-db");
    this.version(1).stores({
      offline_queue: "++id, createdAt",
    });
    this.version(2).stores({
      offline_queue: "++id, createdAt",
      scenarios: "id, teacher_id, category_id, is_public",
      categories: "id, teacher_id",
      class_scenario_status: "[class_id+scenario_id], class_id, scenario_id",
    });
  }
}

let _db: CyberDB | null = null;
export function getDB() {
  if (typeof window === "undefined") return null;
  if (!_db) _db = new CyberDB();
  return _db;
}
