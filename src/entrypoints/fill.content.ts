import { fillDay } from '../lib/fill_fields';

export default defineContentScript({
  matches: ['https://bildung.ihk.de/*'],
  registration: 'runtime',
  world: 'MAIN',
  main: async () => {
    return await fillDay(window.currentWeek);
  },
});
