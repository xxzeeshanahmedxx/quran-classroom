import type { APIRoute } from 'astro';
import { getDb, createSlot, getSlotCountByTeacherDate } from '../../../lib/db';
import { todayPK } from '../../../lib/utils';

const TIME_RE = /^([01]\d|2[0-3]):([0-5]\d)$/;
const MAX_SLOTS = 7;

export const POST: APIRoute = async (context) => {
  if (!context.locals.user || context.locals.user.type !== 'teacher') {
    return new Response('Unauthorized', { status: 401 });
  }

  const formData = await context.request.formData();
  const time = (formData.get('time') as string || '').trim();
  if (!time || !TIME_RE.test(time)) {
    return new Response('Invalid time', { status: 400 });
  }
  const today = todayPK();
  const db = await getDb(context);

  // Enforce max 7 slots per day
  const count = await getSlotCountByTeacherDate(db, 1, today);
  if (count >= MAX_SLOTS) return new Response('Max 7 slots per day', { status: 400 });

  await createSlot(db, 1, today, time);
  return context.redirect('/teach/dashboard');
};
