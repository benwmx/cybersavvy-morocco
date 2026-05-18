import Dexie, { type Table } from "dexie";

export interface QueuedResult {
  id?: number;
  payload: {
    class_id: string;
    massar_code: string;
    scenario_id: string;
    score: number;
    max_score: number;
    mistakes: string[];
  };
  createdAt: number;
}

class CyberDB extends Dexie {
  offline_queue!: Table<QueuedResult, number>;
  constructor() {
    super("cyber-safety-db");
    this.version(1).stores({
      offline_queue: "++id, createdAt",
    });
  }
}

let _db: CyberDB | null = null;
export function getDB() {
  if (typeof window === "undefined") return null;
  if (!_db) _db = new CyberDB();
  return _db;
}
