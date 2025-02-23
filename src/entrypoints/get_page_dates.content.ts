import { getPageDates } from '../lib/fill_fields';

export default defineContentScript({
  matches: ['https://bildung.ihk.de/*'],
  registration: 'runtime',
  main: () => {
    return getPageDates();
  },
});
