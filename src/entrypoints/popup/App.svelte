<script lang="ts">
  import Spinner from '@/lib/Spinner.svelte';
  import type { Weeks } from '../../lib/fill_fields_types';

  let fileInput: HTMLInputElement | null = $state(null);
  let files: any = $state(null);
  let parsedData: Weeks | null = $state(null);
  let error: string | null = $state(null);
  let hasFiles: boolean = $derived(files != null && files.length != 0);

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

  $inspect(files);
</script>

<main class="w-64 h-64">
  <div
    class="w-full h-full text-neutral-50 bg-neutral-900 flex flex-col-reverse items-center justify-center gap-y-8"
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
        class="disabled:bg-neutral-400 bg-neutral-50 enabled:hover:bg-neutral-200 text-neutral-900 enabled:hover:cursor-pointer px-4 py-1 rounded-sm border-none"
        >Abbrechen</button
      >
      <p>Ausfüllen wird abgebrochen.</p>
    {:else}
      <button
        disabled={!hasFiles}
        class="disabled:bg-neutral-400 bg-neutral-50 enabled:hover:bg-neutral-200 text-neutral-900 enabled:hover:cursor-pointer px-4 py-1 rounded-sm border-none"
        onclick={async () => {
          isCancelled = false;
          loading = true;
          const tabId = (
            await browser.tabs.query({ active: true, currentWindow: true })
          )[0].id!;
          browser.runtime.onMessage.addListener((message) => {
            if (message.action === 'stop') {
              loading = false;
            }
          });
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
        }}>Start</button
      >
      <div class="flex flex-col gap-y-1 items-center">
        <div class="text-center">
          <input
            bind:files
            bind:this={fileInput}
            type="file"
            accept=".json"
            onchange={handleFileSelect}
            class="hidden"
          />
          <button
            class="disabled:bg-neutral-400 bg-neutral-50 enabled:hover:bg-neutral-200 text-neutral-900 enabled:hover:cursor-pointer px-4 py-1 rounded-sm border-none"
            onclick={() => fileInput?.click()}
          >
            JSON-Datei Uploaden
          </button>
        </div>
        <p class="text-white">
          {#if hasFiles}
            {files[0].name}
          {:else}
            {'<Keine Datei>'}
          {/if}
        </p>
      </div>
    {/if}
  </div>
</main>
