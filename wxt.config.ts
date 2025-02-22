import { defineConfig } from 'wxt';
import tailwindcss from '@tailwindcss/vite';

// See https://wxt.dev/api/config.html
export default defineConfig({
  srcDir: 'src',
  extensionApi: 'chrome',
  modules: ['@wxt-dev/module-svelte'],
  vite: () => ({ plugins: [tailwindcss()] }),
  manifest: {
    permissions: ['storage'],
    web_accessible_resources: [
      {
        resources: ['fill_fields.js'],
        matches: ['*://*/*'],
      },
    ],
  },
});
