import type { APIRoute } from 'astro';
import { getDb, deleteStudent } from '../../../lib/db';

export const POST: APIRoute = async (context) => {
  if (!context.locals.user || context.locals.user.type !== 'teacher') {
    return new Response('Unauthorized', { status: 401 });
  }

  const body = await context.request.json();
  const db = await getDb(context);

  // Clean up slot references
  const slots = await db.prepare("SELECT * FROM slots WHERE student_ids LIKE ?").bind(`%"${body.id}"%`).all<any>();
  for (const slot of slots.results) {
    const ids: number[] = JSON.parse(slot.student_ids || '[]');
    const filtered = ids.filter((id: number) => id !== body.id);
    await db.prepare('UPDATE slots SET student_ids = ? WHERE id = ?').bind(JSON.stringify(filtered), slot.id).run();
  }

  await deleteStudent(db, body.id);
  return new Response('OK', { status: 200 });
};
