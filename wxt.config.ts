import { defineConfig } from 'wxt';
import tailwindcss from '@tailwindcss/vite';

// See https://wxt.dev/api/config.html
export default defineConfig({
  srcDir: 'src',
  extensionApi: 'chrome',
  modules: ['@wxt-dev/module-svelte'],
  vite: () => ({ plugins: [tailwindcss()] }),
  manifest: {
    version: '1.0.0',
    host_permissions: ['https://bildung.ihk.de/*'],
    permissions: ['storage', 'scripting'],
    web_accessible_resources: [
      {
        resources: ['fill_fields.js'],
        matches: ['https://bildung.ihk.de/*'],
      },
    ],
  },
});
