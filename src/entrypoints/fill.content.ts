export default defineContentScript({
  matches: ['https://bildung.ihk.de/*'],
  registration: 'runtime',
  world: 'MAIN',
  main: async () => {
    return await injectScript('/fill_fields.js', { keepInDom: true });
  },
});
