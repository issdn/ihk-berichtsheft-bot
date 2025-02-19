import { fill } from './popup/fill_fields';

export default defineContentScript({
  matches: ['<all_urls>'],
  registration: 'runtime',
  main: async () => await fill(),
});
