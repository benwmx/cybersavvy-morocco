import { nanoid } from "nanoid";

// Mock-first Supabase adapter.
// Replace by setting VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY and wiring real client here.

export interface ClassRow {
  id: string;
  teacher_id: string;
  name: string;
  access_code: string;
  created_at: number;
}
export interface ResultRow {
  id: string;
  class_id: string;
  student_name: string;
  scenario_id: string;
  score: number;
  max_score: number;
  mistakes: string[];
  created_at: number;
}
export interface TeacherSession {
  id: string;
  email: string;
}

const LS_CLASSES = "cs.classes";
const LS_RESULTS = "cs.results";
const LS_TEACHERS = "cs.teachers";
const LS_SESSION = "cs.teacher_session";

function read<T>(key: string, fallback: T): T {
  if (typeof localStorage === "undefined") return fallback;
  try {
    const v = localStorage.getItem(key);
    return v ? (JSON.parse(v) as T) : fallback;
  } catch {
    return fallback;
  }
}
function write<T>(key: string, val: T) {
  if (typeof localStorage === "undefined") return;
  localStorage.setItem(key, JSON.stringify(val));
}

function genCode() {
  // 6-char uppercase alphanumeric, no confusing chars
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let out = "";
  for (let i = 0; i < 6; i++) out += chars[Math.floor(Math.random() * chars.length)];
  return out;
}

function seed() {
  const classes = read<ClassRow[]>(LS_CLASSES, []);
  if (classes.length === 0) {
    const seedTeacher = "demo-teacher";
    const demoClass: ClassRow = {
      id: nanoid(),
      teacher_id: seedTeacher,
      name: "Demo · Classe 9ème",
      access_code: "DEMO01",
      created_at: Date.now(),
    };
    write(LS_CLASSES, [demoClass]);
    // seed a few results
    const results: ResultRow[] = [
      {
        id: nanoid(),
        class_id: demoClass.id,
        student_name: "Aya",
        scenario_id: "phishing",
        score: 2,
        max_score: 3,
        mistakes: ["phishing-q2"],
        created_at: Date.now(),
      },
      {
        id: nanoid(),
        class_id: demoClass.id,
        student_name: "Youssef",
        scenario_id: "passwords",
        score: 3,
        max_score: 3,
        mistakes: [],
        created_at: Date.now(),
      },
      {
        id: nanoid(),
        class_id: demoClass.id,
        student_name: "Sara",
        scenario_id: "phishing",
        score: 1,
        max_score: 3,
        mistakes: ["phishing-q1", "phishing-q2"],
        created_at: Date.now(),
      },
    ];
    write(LS_RESULTS, results);
  }
}

export const api = {
  // ---- AUTH (mock) ----
  async signUp(email: string, password: string): Promise<TeacherSession> {
    const teachers = read<Record<string, { id: string; password: string }>>(LS_TEACHERS, {});
    if (teachers[email]) throw new Error("Email already in use");
    const id = nanoid();
    teachers[email] = { id, password };
    write(LS_TEACHERS, teachers);
    const session = { id, email };
    write(LS_SESSION, session);
    return session;
  },
  async signIn(email: string, password: string): Promise<TeacherSession> {
    const teachers = read<Record<string, { id: string; password: string }>>(LS_TEACHERS, {});
    const t = teachers[email];
    if (!t || t.password !== password) throw new Error("Invalid credentials");
    const session = { id: t.id, email };
    write(LS_SESSION, session);
    return session;
  },
  signOut() {
    if (typeof localStorage !== "undefined") localStorage.removeItem(LS_SESSION);
  },
  getSession(): TeacherSession | null {
    return read<TeacherSession | null>(LS_SESSION, null);
  },

  // ---- CLASSES ----
  async verifyClassCode(code: string): Promise<ClassRow | null> {
    seed();
    const classes = read<ClassRow[]>(LS_CLASSES, []);
    const found = classes.find((c) => c.access_code.toUpperCase() === code.toUpperCase());
    return found ?? null;
  },
  async createClass(name: string): Promise<ClassRow> {
    const session = api.getSession();
    if (!session) throw new Error("Not authenticated");
    const classes = read<ClassRow[]>(LS_CLASSES, []);
    const row: ClassRow = {
      id: nanoid(),
      teacher_id: session.id,
      name,
      access_code: genCode(),
      created_at: Date.now(),
    };
    classes.push(row);
    write(LS_CLASSES, classes);
    return row;
  },
  async listMyClasses(): Promise<ClassRow[]> {
    const session = api.getSession();
    if (!session) return [];
    const classes = read<ClassRow[]>(LS_CLASSES, []);
    return classes
      .filter((c) => c.teacher_id === session.id)
      .sort((a, b) => b.created_at - a.created_at);
  },

  // ---- RESULTS ----
  async insertResult(payload: Omit<ResultRow, "id" | "created_at">): Promise<ResultRow> {
    const results = read<ResultRow[]>(LS_RESULTS, []);
    const row: ResultRow = { id: nanoid(), created_at: Date.now(), ...payload };
    results.push(row);
    write(LS_RESULTS, results);
    return row;
  },
  async listResultsForTeacher(): Promise<ResultRow[]> {
    const session = api.getSession();
    if (!session) return [];
    const classes = read<ClassRow[]>(LS_CLASSES, []).filter((c) => c.teacher_id === session.id);
    const ids = new Set(classes.map((c) => c.id));
    const results = read<ResultRow[]>(LS_RESULTS, []);
    return results.filter((r) => ids.has(r.class_id));
  },
};

seed();
