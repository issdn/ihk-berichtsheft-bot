<script lang="ts">
  import Spinner from '@/lib/Spinner.svelte';
  import type { Weeks } from '../../lib/fill_fields_types';

  let fileInput: HTMLInputElement | null = $state(null);
  let parsedData: Weeks | null = $state(null);
  let error: string | null = $state(null);

  let loading = $state(false);

  let isCancelled = $state(false);

  async function handleFileSelect() {
    error = null;
    parsedData = null;

    if (!fileInput?.files?.length) {
      error = 'Please select a file';
      return;
    }

    const file = fileInput.files[0];

    try {
      const text = await file.text();
      parsedData = JSON.parse(text);
    } catch (e) {
      console.error(
        e instanceof Error ? e.message : 'An unknown error occurred'
      );
    }
  }
</script>

<main class="w-64 h-64">
  <div
    class="w-full h-full text-slate-50 bg-slate-900 flex flex-col items-center justify-center gap-y-8"
  >
    {#if loading}
      <Spinner />
      <button
        disabled={isCancelled}
        onclick={async () => {
          isCancelled = true;
          const tabId = (
            await browser.tabs.query({ active: true, currentWindow: true })
          )[0].id!;
          await browser.scripting.executeScript<[], void>({
            target: { tabId },
            world: 'MAIN',
            func: () => {
              window.pData = [];
            },
            args: [],
          });
        }}
        class="bg-slate-50 enabled:hover:bg-slate-200 text-slate-900 enabled:hover:cursor-pointer px-4 py-1 rounded-sm border-none"
        >Abbrechen</button
      >
      <p>Ausfüllen wird abgebrochen.</p>
    {:else}
      <button
        class="bg-slate-50 enabled:hover:bg-slate-200 text-slate-900 enabled:hover:cursor-pointer px-4 py-1 rounded-sm border-none"
        onclick={async () => {
          isCancelled = false;
          loading = true;
          const tabId = (
            await browser.tabs.query({ active: true, currentWindow: true })
          )[0].id!;
          await browser.scripting.executeScript<[Weeks], void>({
            target: { tabId },
            world: 'MAIN',
            func: (data) => {
              window.pData = data;
            },
            args: [parsedData!],
          });
          await browser.scripting.executeScript<[], Promise<boolean>>({
            target: { tabId },
            files: ['content-scripts/fill.js'],
          });
          loading = false;
        }}>Los!</button
      >
      <div class="text-center">
        <input
          bind:this={fileInput}
          type="file"
          accept=".json"
          onchange={handleFileSelect}
          class="hidden"
        />
        <button
          class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md transition-colors"
          onclick={() => fileInput?.click()}
        >
          Upload JSON File
        </button>
      </div>
    {/if}
  </div>
</main>
