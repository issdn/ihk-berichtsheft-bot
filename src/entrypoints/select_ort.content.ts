import { selectOption } from '../lib/fill_fields';

export default defineContentScript({
  matches: ['https://bildung.ihk.de/*'],
  registration: 'runtime',
  main: async () => {
    const locations = {
      Schule: 0,
      Betrieb: 1,
      Unterweisung: 2,
      'Schule/Betrieb': 3,
    };

    return await selectOption(
      document,
      locations[window.currentWeek.ort as keyof typeof locations]
    );
  },
});
