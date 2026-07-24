// Only available in Workers runtime — dev uses mock/env
let _cfEnv: any = {};
try {
  _cfEnv = (await import('cloudflare:workers')).env;
} catch {
  _cfEnv = {};
}

export function getEnv(context: any, key: string): string {
  return _cfEnv?.[key] || process.env[key] || '';
}
