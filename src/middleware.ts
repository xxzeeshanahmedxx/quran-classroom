import { defineMiddleware } from 'astro:middleware';
import { getSession } from './lib/auth';

export const onRequest = defineMiddleware(async (context, next) => {
  context.locals.user = getSession(context);
  return next();
});
