import type { APIRoute } from 'astro';
import { clearSession } from '../lib/auth';

export const GET: APIRoute = async (context) => {
  clearSession(context);
  const referer = context.request.headers.get('referer') || '/';
  return context.redirect(referer);
};
