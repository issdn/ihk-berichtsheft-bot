<script lang="ts">
  import Spinner from '@/lib/Spinner.svelte';
  import type { Day, Days } from '../../lib/fill_fields_types';
  import { sleep } from '../../lib/fill_fields';

  let fileInput: HTMLInputElement | null = $state(null);
  let files: any = $state(null);
  let parsedData: Days | null = $state(null);
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

  function sortWeeks(entries: Days) {
    return [...entries].sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      return dateB.getTime() - dateA.getTime();
    });
  }

  async function getPageDates(tabId: number) {
    return (
      await browser.scripting.executeScript<[], Promise<[Date, Date]>>({
        target: { tabId },
        files: ['content-scripts/get_page_dates.js'],
      })
    )[0].result!.map((dateStr) => {
      const date = new Date(dateStr);
      date.setHours(0, 0, 0);
      return date;
    });
  }

  async function isDateInPageRange(tabId: number, targetDate: string) {
    const [startDate, endDate] = await getPageDates(tabId);

    const date = new Date(targetDate);
    date.setHours(0, 0, 0, 0);
    console.log(
      startDate.toDateString(),
      date.toDateString(),
      endDate.toDateString()
    );
    return date >= startDate && date <= endDate;
  }

  async function vorherigeWoche(tabId: number) {
    await browser.scripting.executeScript<[], void>({
      target: { tabId },
      func: () => {
        (
          document.querySelector(
            'a[aria-label="Vorherige Woche"]'
          ) as HTMLElement
        ).click();
      },
    });
  }

  async function fillOutData(tabId: number, week: Day) {
    await browser.scripting.executeScript<[Day], void>({
      target: { tabId },
      world: 'MAIN',
      func: (data) => {
        window.currentWeek = data;
      },
      args: [week],
    });
    const res = await browser.scripting.executeScript<[], Promise<boolean>>({
      target: { tabId },
      world: 'MAIN',
      files: ['content-scripts/select_ort.js'],
    });
    const isTouched = res[0].result ?? false;
    if (isTouched) return;
    await sleep(1000);
    await browser.scripting.executeScript<[string], void>({
      target: { tabId },
      world: 'MAIN',
      args: [week.description ?? ''],
      func: (data) => {
        (
          document.querySelector('.ck-editor__editable') as any
        ).ckeditorInstance.setData(data);
      },
    });
    await browser.scripting.executeScript<[], Promise<boolean>>({
      target: { tabId },
      world: 'MAIN',
      files: ['content-scripts/fill.js'],
    });
  }

  async function fill(days: Days) {
    error = null;
    const tabId = (
      await browser.tabs.query({ active: true, currentWindow: true })
    )[0].id!;
    const sorted = sortWeeks(days);
    const [_, endDate] = await getPageDates(tabId);
    const latestDate = new Date(sorted[0].date);
    if (latestDate > endDate) {
      error = `Um das Skript zu starten musst du die späteste Woche aus der JSON-Datei auswählen.\nD.h. öffne die Woche ${latestDate.toLocaleDateString(
        'de-DE',
        {
          day: '2-digit',
          month: '2-digit',
          year: '2-digit',
        }
      )}`;
      return;
    }

    let daysInWeek = [];
    for (let i = 0; i < days.length; i++) {
      const day = days[i];
      while (!(await isDateInPageRange(tabId, day.date))) {
        if (isCancelled) return;
        await vorherigeWoche(tabId);
        await sleep(1000);
      }
      daysInWeek.push(day);
      const nextDay = days[i + 1];
      if (
        nextDay == undefined ||
        !(await isDateInPageRange(tabId, nextDay.date))
      ) {
        const first = daysInWeek.shift()!;
        const week = daysInWeek.reduce(
          (prev, { date, ort, qualifications, description }) => {
            return {
              date,
              ort,
              qualifications: [
                ...new Set([...prev.qualifications, ...qualifications]),
              ],
              description: `${prev.description}\n\n${description}`,
            };
          },
          first
        );
        await fillOutData(tabId, week);
        daysInWeek = [];
      }
    }
  }
</script>

<main class="w-64 h-64">
  <div
    class="w-full h-full text-neutral-50 bg-neutral-900 flex flex-col-reverse items-center justify-center gap-y-8 p-8"
  >
    {#if loading}
      <Spinner />
      <button
        disabled={isCancelled}
        onclick={async () => {
          isCancelled = true;
        }}
        class="disabled:bg-neutral-400 bg-neutral-50 enabled:hover:bg-neutral-200 text-neutral-900 enabled:hover:cursor-pointer px-4 py-1 rounded-sm border-none"
        >Abbrechen</button
      >
      {#if isCancelled}
        <p>Ausfüllen wird abgebrochen.</p>
      {/if}
    {:else}
      <button
        disabled={!hasFiles}
        class="disabled:bg-neutral-400 bg-neutral-50 enabled:hover:bg-neutral-200 text-neutral-900 enabled:hover:cursor-pointer px-4 py-1 rounded-sm border-none"
        onclick={async () => {
          isCancelled = false;
          loading = true;
          await fill(parsedData!);
          loading = false;
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
    {#if error != null}
      <p class="text-red-400">{error}</p>
    {/if}
  </div>
</main>
