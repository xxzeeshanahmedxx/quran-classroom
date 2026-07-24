import type { APIRoute } from 'astro';
import { getDb, assignStudentToSlot } from '../../../lib/db';

export const POST: APIRoute = async (context) => {
  if (!context.locals.user || context.locals.user.type !== 'teacher') {
    return new Response('Unauthorized', { status: 401 });
  }

  const body = await context.request.json();
  const db = getDb(context);
  await assignStudentToSlot(db, body.slotId, body.studentIds);
  return new Response('OK', { status: 200 });
};
