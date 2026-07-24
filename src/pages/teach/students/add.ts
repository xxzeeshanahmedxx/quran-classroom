import type { APIRoute } from 'astro';
import { getDb, createStudent, isStudentPinTaken, getStudentCountByTeacher } from '../../../lib/db';

const VALID_TITLES = ['Nazra', 'Hifz', 'Tajweed'];
const VALID_GENDERS = ['male', 'female'];
const MAX_STUDENTS = 20;

function generatePin(): string {
  return Math.floor(1000 + Math.random() * 9000).toString();
}

export const POST: APIRoute = async (context) => {
  if (!context.locals.user || context.locals.user.type !== 'teacher') {
    return new Response('Unauthorized', { status: 401 });
  }

  const formData = await context.request.formData();
  const name = (formData.get('name') as string || '').trim();
  if (!name) return context.redirect('/teach/students?error=invalid_name');

  const title = formData.get('title') as string || 'Nazra';
  if (!VALID_TITLES.includes(title)) return context.redirect('/teach/students?error=invalid_title');

  const gender = formData.get('gender') as string || 'male';
  if (!VALID_GENDERS.includes(gender)) return context.redirect('/teach/students?error=invalid_gender');

  const db = await getDb(context);

  // Enforce max 20 students
  const count = await getStudentCountByTeacher(db, 1);
  if (count >= MAX_STUDENTS) return context.redirect('/teach/students?error=max_students');

  // Generate unique PIN (retry up to 10 times)
  let pin = generatePin();
  for (let i = 0; i < 10; i++) {
    if (!(await isStudentPinTaken(db, pin))) break;
    pin = generatePin();
  }

  await createStudent(db, name, title, gender, pin, 1);
  return context.redirect('/teach/students');
};
