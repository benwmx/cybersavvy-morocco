import Dexie, { type EntityTable } from 'dexie';

interface Class {
  id: string;
  name: string;
  access_code: string;
  teacher_id: string;
  assigned_scenarios: string[];
  sync_status: 'synced' | 'pending_upload' | 'pending_delete';
}

interface Student {
  id: string;
  class_id: string;
  massar_code: string;
  name_fr: string;
  name_ar: string;
  sync_status: 'synced' | 'pending_upload' | 'pending_delete';
}

interface Scenario {
  id: string;
  teacher_id: string | null;
  category: string;
  title: { fr: string; ar: string };
  description: { fr: string; ar: string };
  questions: any[];
  sync_status: 'synced' | 'pending_upload' | 'pending_delete';
}

const db = new Dexie('CyberSafeDB') as Dexie & {
  classes: EntityTable<Class, 'id'>;
  students: EntityTable<Student, 'id'>;
  scenarios: EntityTable<Scenario, 'id'>;
};

db.version(1).stores({
  classes: 'id, teacher_id, sync_status',
  students: 'id, class_id, sync_status',
  scenarios: 'id, teacher_id, sync_status'
});

export { db };
