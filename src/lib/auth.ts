import { getDb, getTeacherByPin, getStudentByPin, getTeacherById } from './db';
import { getEnv } from './env';

const SESSION_COOKIE = 'quran_session';
const SESSION_DURATION = 60 * 60 * 24;

export interface SessionUser {
  type: 'teacher' | 'student' | 'admin';
  id: number;
  name: string;
  teacherId?: number;
}

export async function authenticateTeacher(context: any, pin: string): Promise<SessionUser | null> {
  const db = getDb(context);
  const teacher = await getTeacherByPin(db, pin);
  if (!teacher) return null;
  return { type: 'teacher', id: teacher.id, name: teacher.name };
}

export async function authenticateStudent(context: any, pin: string): Promise<SessionUser | null> {
  const db = getDb(context);
  const student = await getStudentByPin(db, pin);
  if (!student) return null;
  const teacher = await getTeacherById(db, student.teacher_id);
  return {
    type: 'student',
    id: student.id,
    name: student.name,
    teacherId: teacher?.id,
  };
}

export function authenticateAdmin(context: any, password: string): SessionUser | null {
  const adminPassword = getEnv(context, 'ADMIN_PASSWORD') || 'changeme';
  if (password === adminPassword) {
    return { type: 'admin', id: 0, name: 'Admin' };
  }
  return null;
}

export function createSession(context: any, user: SessionUser): void {
  const data = Buffer.from(JSON.stringify(user)).toString('base64');
  context.cookies.set(SESSION_COOKIE, data, {
    path: '/',
    maxAge: SESSION_DURATION,
    httpOnly: true,
    sameSite: 'lax',
  });
}

export function getSession(context: any): SessionUser | null {
  const cookie = context.cookies.get(SESSION_COOKIE);
  if (!cookie || !cookie.value) return null;
  try {
    const data = JSON.parse(Buffer.from(cookie.value, 'base64').toString());
    return data as SessionUser;
  } catch {
    return null;
  }
}

export function clearSession(context: any): void {
  context.cookies.delete(SESSION_COOKIE, { path: '/' });
}
