<script lang="ts">
  import Spinner from './Spinner.svelte';

  let loading = $state(false);

  let cancel = $state(false);
</script>

<main class="w-64 h-64">
  <div
    class="w-full h-full text-slate-50 bg-slate-900 flex flex-col items-center justify-center gap-y-8"
  >
    {#if loading}
      <Spinner />
      <button
        disabled={cancel}
        onclick={() => {
          cancel = true;
        }}
        class="bg-slate-50 enabled:hover:bg-slate-200 text-slate-900 enabled:hover:cursor-pointer px-4 py-1 rounded-sm border-none"
        >Abbrechen</button
      >
      <p>Ausfüllen wird abgebrochen.</p>
    {:else}
      <button
        class="bg-slate-50 enabled:hover:bg-slate-200 text-slate-900 enabled:hover:cursor-pointer px-4 py-1 rounded-sm border-none"
        onclick={async () => {
          cancel = false;
          loading = true;
          const tabId = (
            await browser.tabs.query({ active: true, currentWindow: true })
          )[0].id!;
          let shouldLoad = true;
          while (shouldLoad && !cancel) {
            const result = await browser.scripting.executeScript<[], boolean>({
              target: { tabId },
              files: ['content-scripts/fill.js'],
            });
            shouldLoad = result[0].result ?? false;
          }
          loading = false;
        }}>Los!</button
      >
    {/if}
  </div>
</main>
