import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import sitemap from '@astrojs/sitemap';
import vercel from '@astrojs/vercel';
import react from '@astrojs/react';

export default defineConfig({
  site: 'https://clinicasorriso.com.br',
  output: 'static',
  adapter: vercel(),
  integrations: [react(), tailwind({ applyBaseStyles: false }), sitemap()],
});
