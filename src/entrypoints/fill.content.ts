import { fillWeek } from '../lib/fill_fields';

export default defineContentScript({
  matches: ['https://bildung.ihk.de/*'],
  registration: 'runtime',
  main: async () => {
    return await fillWeek(window.currentWeek);
  },
});
