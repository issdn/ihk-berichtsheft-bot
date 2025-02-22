export default defineContentScript({
  matches: ['<all_urls>'],
  registration: 'runtime',
  world: 'MAIN',
  main: async () => {
    return await injectScript('/fill_fields.js', { keepInDom: true });
  },
});
