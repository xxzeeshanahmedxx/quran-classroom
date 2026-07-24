import type { APIRoute } from 'astro';
import { getDb, createTeacher } from '../../../lib/db';

export const POST: APIRoute = async (context) => {
  if (!context.locals.user || context.locals.user.type !== 'admin') {
    return new Response('Unauthorized', { status: 401 });
  }

  const formData = await context.request.formData();
  const name = formData.get('name') as string;
  const email = formData.get('email') as string || '';
  const pin = Math.floor(1000 + Math.random() * 9000).toString();
  const db = getDb(context);
  await createTeacher(db, name, email, pin);
  return context.redirect('/admin/dashboard');
};
