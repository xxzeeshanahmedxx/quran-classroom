import type { APIRoute } from 'astro';
import { getDb, deleteSlot } from '../../../lib/db';

export const POST: APIRoute = async (context) => {
  if (!context.locals.user || context.locals.user.type !== 'teacher') {
    return new Response('Unauthorized', { status: 401 });
  }

  const body = await context.request.json();
  const db = await getDb(context);
  const slotId = Number(body.id);
  if (!slotId) return new Response('Bad Request', { status: 400 });

  await deleteSlot(db, slotId);
  return new Response('OK', { status: 200 });
};
