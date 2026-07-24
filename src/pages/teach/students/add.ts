import type { APIRoute } from 'astro';
import { getDb, createStudent } from '../../../lib/db';

export const POST: APIRoute = async (context) => {
  if (!context.locals.user || (context.locals.user.type !== 'teacher' && context.locals.user.type !== 'admin')) {
    return new Response('Unauthorized', { status: 401 });
  }

  const formData = await context.request.formData();
  const name = formData.get('name') as string;
  const title = formData.get('title') as string || 'Nazra';
  const pin = Math.floor(1000 + Math.random() * 9000).toString();
  const teacherId = context.locals.user.type === 'admin'
    ? Number(context.url.searchParams.get('teacher_id') || '1')
    : context.locals.user.id;

  const db = getDb(context);
  await createStudent(db, name, title, pin, teacherId);
  return context.redirect('/teach/students');
};
