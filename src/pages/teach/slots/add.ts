import type { APIRoute } from 'astro';
import { getDb, createSlot } from '../../../lib/db';

export const POST: APIRoute = async (context) => {
  if (!context.locals.user || context.locals.user.type !== 'teacher') {
    return new Response('Unauthorized', { status: 401 });
  }

  const formData = await context.request.formData();
  const time = formData.get('time') as string;
  const today = new Date().toISOString().slice(0, 10);
  const db = getDb(context);
  await createSlot(db, context.locals.user.id, today, time);
  return context.redirect('/teach/dashboard');
};
