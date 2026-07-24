export function getEnv(context: any, key: string): string {
  if (context.locals?.runtime?.env?.[key]) {
    return context.locals.runtime.env[key];
  }
  return process.env[key] || '';
}
