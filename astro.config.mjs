import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import cloudflare from '@astrojs/cloudflare';
import react from '@astrojs/react';
import path from 'path';

const isBuild = process.argv.includes('build');

export default defineConfig({
  site: 'https://example.com',
  output: 'server',
  adapter: isBuild ? cloudflare() : undefined,
  integrations: [react()],
  vite: {
    plugins: [tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve('./src'),
      },
    },
  },
});
