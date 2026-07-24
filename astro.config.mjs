import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

import cloudflare from '@astrojs/cloudflare';

const isBuild = process.argv.includes('build');

export default defineConfig({
  site: 'https://example.com',
  output: 'server',
  adapter: isBuild ? cloudflare() : undefined,
  vite: {
    plugins: [tailwindcss()],
  },
});
