import { getDb, getTeacherByPin, getStudentByPin, getTeacherById } from './db';
import { getEnv } from './env';
import { createHash } from 'node:crypto';

const SESSION_COOKIE = 'quran_session';
const SESSION_DURATION = 60 * 60 * 24;

export interface SessionUser {
  type: 'teacher' | 'student';
  id: number;
  name: string;
  teacherId?: number;
}

function getSecret(context: any): string {
  return getEnv(context, 'SESSION_SECRET') || 'quran-classroom-secret-2026';
}

function sign(data: string, secret: string): string {
  return createHash('sha256').update(data + secret).digest('hex').slice(0, 16);
}

export async function authenticateTeacher(context: any, pin: string): Promise<SessionUser | null> {
  const db = await getDb(context);
  const teacher = await getTeacherByPin(db, pin);
  if (!teacher) return null;
  return { type: 'teacher', id: teacher.id, name: teacher.name };
}

export async function authenticateStudent(context: any, pin: string): Promise<SessionUser | null> {
  const db = await getDb(context);
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

export function createSession(context: any, user: SessionUser): void {
  const secret = getSecret(context);
  const payload = JSON.stringify(user);
  const sig = sign(payload, secret);
  const data = Buffer.from(JSON.stringify({ u: user, s: sig })).toString('base64');
  context.cookies.set(SESSION_COOKIE, data, {
    path: '/',
    maxAge: SESSION_DURATION,
    httpOnly: true,
    sameSite: 'lax',
    secure: context.url?.protocol === 'https:',
  });
}

export function getSession(context: any): SessionUser | null {
  const cookie = context.cookies.get(SESSION_COOKIE);
  if (!cookie || !cookie.value) return null;
  try {
    const parsed = JSON.parse(Buffer.from(cookie.value, 'base64').toString());
    const secret = getSecret(context);
    const expectedSig = sign(JSON.stringify(parsed.u), secret);
    if (parsed.s !== expectedSig) return null;
    return parsed.u as SessionUser;
  } catch {
    return null;
  }
}

export function clearSession(context: any): void {
  context.cookies.delete(SESSION_COOKIE, { path: '/' });
}
