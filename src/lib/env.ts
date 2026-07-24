import { env as cfEnv } from 'cloudflare:workers';

export function getEnv(_context: any, key: string): string {
  return (cfEnv as any)[key] || process.env[key] || '';
}
