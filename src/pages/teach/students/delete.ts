import type { APIRoute } from 'astro';
import { getDb, deleteStudent } from '../../../lib/db';

export const POST: APIRoute = async (context) => {
  if (!context.locals.user || (context.locals.user.type !== 'teacher' && context.locals.user.type !== 'admin')) {
    return new Response('Unauthorized', { status: 401 });
  }

  const body = await context.request.json();
  const db = getDb(context);
  await deleteStudent(db, body.id);
  return new Response('OK', { status: 200 });
};
