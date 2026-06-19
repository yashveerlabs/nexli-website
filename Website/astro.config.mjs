// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  // TODO(owner): set to the real production domain — used for canonical URLs, sitemap, and OG tags.
  // Placeholder only — never a real or Nexli-branded domain until the owner registers one.
  site: 'https://domain.com',
  trailingSlash: 'ignore',
  integrations: [sitemap()],
  vite: {
    plugins: [tailwindcss()],
  },
});
