export interface Teacher {
  id: number;
  name: string;
  email: string;
  pin: string;
}

export interface Student {
  id: number;
  name: string;
  title: string;
  pin: string;
  teacher_id: number;
}

export interface Slot {
  id: number;
  teacher_id: number;
  date: string;
  time: string;
  student_ids: string;
  room_name: string | null;
  status: string;
}

import { env as cfEnv } from 'cloudflare:workers';

interface DB {
  prepare(sql: string): {
    bind(...args: any[]): {
      first<T>(): Promise<T | null>;
      all<T>(): Promise<{ results: T[] }>;
      run(): Promise<{ meta: any }>;
    };
  };
}

function getDB(_context: any): DB {
  if ((cfEnv as any)?.DB) {
    return (cfEnv as any).DB;
  }
  return createMockDB();
}

let mockData: { teachers: Teacher[]; students: Student[]; slots: Slot[] } = {
  teachers: [
    { id: 1, name: 'Ustadh Ahmad', email: 'ahmad@example.com', pin: '1234' },
  ],
  students: [
    { id: 1, name: 'Ali', title: 'Nazra', pin: '1111', teacher_id: 1 },
    { id: 2, name: 'Fatima', title: 'Hifz', pin: '2222', teacher_id: 1 },
    { id: 3, name: 'Omar', title: 'Nazra', pin: '3333', teacher_id: 1 },
  ],
  slots: [],
};

function createMockDB(): DB {
  return {
    prepare(sql: string) {
      return {
        bind(...args: any[]) {
          return {
            async first<T>(): Promise<T | null> {
              const rows = runMockQuery(sql, args);
              return rows.length > 0 ? (rows[0] as T) : null;
            },
            async all<T>(): Promise<{ results: T[] }> {
              const rows = runMockQuery(sql, args);
              return { results: rows as T[] };
            },
            async run(): Promise<{ meta: any }> {
              runMockQuery(sql, args);
              return { meta: {} };
            },
          };
        },
      };
    },
  };
}

function runMockQuery(sql: string, args: any[]): any[] {
  sql = sql.replace(/\s+/g, ' ').trim();

  if (sql.startsWith('INSERT INTO teachers')) {
    const t = { id: mockData.teachers.length + 1, name: args[0], email: args[1], pin: args[2] };
    mockData.teachers.push(t);
    return [t];
  }
  if (sql.startsWith('INSERT INTO students')) {
    const s = { id: mockData.students.length + 1, name: args[0], title: args[1], pin: args[2], teacher_id: args[3] };
    mockData.students.push(s);
    return [s];
  }
  if (sql.startsWith('INSERT INTO slots')) {
    const s = { id: mockData.slots.length + 1, teacher_id: args[0], date: args[1], time: args[2], student_ids: '[]', room_name: null, status: 'pending' };
    mockData.slots.push(s);
    return [s];
  }
  if (sql.includes('SELECT * FROM teachers WHERE pin = ?')) {
    return mockData.teachers.filter((t) => t.pin === args[0]);
  }
  if (sql.includes('SELECT * FROM teachers WHERE id = ?')) {
    return mockData.teachers.filter((t) => t.id === args[0]);
  }
  if (sql.includes('SELECT * FROM students WHERE pin = ?')) {
    return mockData.students.filter((s) => s.pin === args[0]);
  }
  if (sql.includes('SELECT * FROM students WHERE teacher_id') && sql.includes('ORDER BY name')) {
    return mockData.students.filter((s) => s.teacher_id === args[0]).sort((a, b) => a.name.localeCompare(b.name));
  }
  if (sql.includes('SELECT * FROM slots WHERE teacher_id = ? AND date = ? ORDER BY time')) {
    return mockData.slots.filter((s) => s.teacher_id === args[0] && s.date === args[1]).sort((a, b) => a.time.localeCompare(b.time));
  }
  if (sql.includes('SELECT * FROM slots WHERE id = ?')) {
    return mockData.slots.filter((s) => s.id === args[0]);
  }
  if (sql.includes('SELECT * FROM teachers ORDER BY name')) {
    return [...mockData.teachers].sort((a, b) => a.name.localeCompare(b.name));
  }
  if (sql.startsWith('DELETE FROM slots')) {
    mockData.slots = mockData.slots.filter((s) => s.id !== args[0]);
    return [];
  }
  if (sql.startsWith('DELETE FROM students')) {
    mockData.students = mockData.students.filter((s) => s.id !== args[0]);
    return [];
  }
  if (sql.startsWith('UPDATE slots SET student_ids = ? WHERE id = ?')) {
    const slot = mockData.slots.find((s) => s.id === args[1]);
    if (slot) slot.student_ids = args[0];
    return [];
  }
  if (sql.includes("UPDATE slots SET room_name")) {
    const slot = mockData.slots.find((s) => s.id === args[1]);
    if (slot) {
      slot.room_name = args[0];
      slot.status = 'active';
    }
    return [];
  }
  if (sql.includes('UPDATE students SET name = ?, title = ?')) {
    const student = mockData.students.find((s) => s.id === args[2]);
    if (student) {
      student.name = args[0];
      student.title = args[1];
    }
    return [];
  }
  return [];
}

export function getDb(context: any): DB {
  return getDB(context);
}

export async function getTeacherByPin(db: DB, pin: string): Promise<Teacher | null> {
  return db.prepare('SELECT * FROM teachers WHERE pin = ?').bind(pin).first<Teacher>();
}

export async function getStudentByPin(db: DB, pin: string): Promise<Student | null> {
  return db.prepare('SELECT * FROM students WHERE pin = ?').bind(pin).first<Student>();
}

export async function getTeacherById(db: DB, id: number): Promise<Teacher | null> {
  return db.prepare('SELECT * FROM teachers WHERE id = ?').bind(id).first<Teacher>();
}

export async function getStudentsByTeacher(db: DB, teacherId: number): Promise<Student[]> {
  const r = await db.prepare('SELECT * FROM students WHERE teacher_id = ? ORDER BY name').bind(teacherId).all<Student>();
  return r.results;
}

export async function getSlotsByTeacherDate(db: DB, teacherId: number, date: string): Promise<Slot[]> {
  const r = await db.prepare('SELECT * FROM slots WHERE teacher_id = ? AND date = ? ORDER BY time').bind(teacherId, date).all<Slot>();
  return r.results;
}

export async function createSlot(db: DB, teacherId: number, date: string, time: string): Promise<Slot> {
  return (await db.prepare('INSERT INTO slots (teacher_id, date, time) VALUES (?, ?, ?) RETURNING *').bind(teacherId, date, time).first<Slot>())!;
}

export async function deleteSlot(db: DB, slotId: number): Promise<void> {
  await db.prepare('DELETE FROM slots WHERE id = ?').bind(slotId).run();
}

export async function assignStudentToSlot(db: DB, slotId: number, studentIds: number[]): Promise<void> {
  await db.prepare('UPDATE slots SET student_ids = ? WHERE id = ?').bind(JSON.stringify(studentIds), slotId).run();
}

export async function createStudent(db: DB, name: string, title: string, pin: string, teacherId: number): Promise<Student> {
  return (await db.prepare('INSERT INTO students (name, title, pin, teacher_id) VALUES (?, ?, ?, ?) RETURNING *').bind(name, title, pin, teacherId).first<Student>())!;
}

export async function deleteStudent(db: DB, id: number): Promise<void> {
  await db.prepare('DELETE FROM students WHERE id = ?').bind(id).run();
}

export async function getStudentById(db: DB, id: number): Promise<Student | null> {
  return db.prepare('SELECT * FROM students WHERE id = ?').bind(id).first<Student>();
}

export async function getAllTeachers(db: DB): Promise<Teacher[]> {
  const r = await db.prepare('SELECT * FROM teachers ORDER BY name').all<Teacher>();
  return r.results;
}

export async function createTeacher(db: DB, name: string, email: string, pin: string): Promise<Teacher> {
  return (await db.prepare('INSERT INTO teachers (name, email, pin) VALUES (?, ?, ?) RETURNING *').bind(name, email, pin).first<Teacher>())!;
}

export async function getSlotById(db: DB, slotId: number): Promise<Slot | null> {
  return db.prepare('SELECT * FROM slots WHERE id = ?').bind(slotId).first<Slot>();
}
