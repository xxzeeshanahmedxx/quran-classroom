import type { APIRoute } from 'astro';
import { getDb, assignStudentToSlot } from '../../../lib/db';

export const POST: APIRoute = async (context) => {
  if (!context.locals.user || context.locals.user.type !== 'teacher') {
    return new Response('Unauthorized', { status: 401 });
  }

  const body = await context.request.json();
  const db = await getDb(context);

  // Verify slot exists
  const slot = await db.prepare('SELECT * FROM slots WHERE id = ?').bind(body.slotId).first<any>();
  if (!slot) return new Response('Slot not found', { status: 404 });

  // Check max 3 students (accounting for duplicates)
  const existing: number[] = JSON.parse(slot.student_ids || '[]');
  const merged = [...new Set([...existing, ...body.studentIds])];
  if (merged.length > 3) {
    return new Response('Max 3 students per slot', { status: 400 });
  }

  await assignStudentToSlot(db, body.slotId, body.studentIds);
  return new Response('OK', { status: 200 });
};
