<script lang="ts">
  import Spinner from '@/lib/Spinner.svelte';
  import type { Day, Days } from '../../lib/fill_fields_types';
  import {
    fillDayBericht,
    fillWeekBericht,
    getDay,
    getPageDates,
    isBerichtFilled,
    qualifikationenByNr,
    rerender,
    sleep,
    vorherigeWoche,
  } from '../../lib/fill_fields';
  import { parseStringList } from '@/lib/helpers';
  import Checkbox from '@/lib/Checkbox.svelte';

  let fileInput: HTMLInputElement | null = $state(null);
  let files: any = $state(null);
  let parsedData: Days | null = $state(null);
  let error: string | null = $state(null);
  let loading = $state(false);
  let isCancelled = $state(false);
  let hasFiles: boolean = $derived(files != null && files.length != 0);
  let shouldOverwrite = $state(false);

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
      error = 'Error parsing file';
      console.error(
        e instanceof Error ? e.message : 'An unknown error occurred'
      );
    }
  }

  function sortWeeks(entries: Days) {
    return [...entries].sort((a, b) => {
      const dateA = new Date(a.datum);
      const dateB = new Date(b.datum);
      return dateB.getTime() - dateA.getTime();
    });
  }

  async function isDateInPageRange(tabId: number, targetDate: string) {
    const [startDate, endDate] = await getPageDates(tabId);

    const date = new Date(targetDate);
    date.setHours(0, 0, 0, 0);
    return date >= startDate && date <= endDate;
  }

  function cancelFilling() {
    isCancelled = true;
  }

  function selectFile() {
    fileInput?.click();
  }

  function processQualifications(day: Day, issues: string[]): number[] {
    return day.qualifikationen
      .map((q) => {
        if (typeof q === 'number') {
          return q;
        } else {
          if (qualifikationenByNr.has(q)) {
            return qualifikationenByNr.get(q);
          }
          issues.push(
            `${day.datum} - "${q}" ist keine erlaubte Qualifikation.`
          );
          return null;
        }
      })
      .filter((q) => q != null);
  }

  function combineWeekData(daysInWeek: Day[]): Day {
    const joinedWeeklyBericht = [...daysInWeek];
    const first = joinedWeeklyBericht.shift()!;

    return joinedWeeklyBericht.reduce(
      (prev, { datum, ort, qualifikationen, text, anwesenheit }) => {
        return {
          anwesenheit,
          datum,
          ort,
          qualifikationen: [
            ...new Set([...prev.qualifikationen, ...qualifikationen]),
          ],
          text: `${prev.text}\n\n${text}`,
        };
      },
      first
    );
  }

  async function fillDailyReports(tabId: number, daysInWeek: Day[], week: Day) {
    return Promise.all(
      Array.from({ length: 5 }, (_, i) => i).map(async (i) => {
        const date = await getDay(tabId, i);
        const daySpecifiedInJson = daysInWeek.find(
          ({ datum }) => date == new Date(datum)
        );
        const dayObj = daySpecifiedInJson ? daySpecifiedInJson : week;
        return fillDayBericht(tabId, dayObj, i);
      })
    );
  }

  async function navigateToCorrectWeek(tabId: number, targetDate: string) {
    while (!(await isDateInPageRange(tabId, targetDate))) {
      if (isCancelled) return false;
      await vorherigeWoche(tabId);
      await sleep(1000);
    }
    return true;
  }

  async function validateDateRange(
    days: Days,
    tabId: number
  ): Promise<boolean> {
    const sorted = sortWeeks(days);
    const [_, endDate] = await getPageDates(tabId);
    const latestDate = new Date(sorted[0].datum);

    if (latestDate > endDate) {
      error = `Um das Skript zu starten musst du die späteste Woche aus der JSON-Datei auswählen.\nD.h. öffne die Woche ${latestDate.toLocaleDateString(
        'de-DE',
        {
          day: '2-digit',
          month: '2-digit',
          year: '2-digit',
        }
      )}`;
      return false;
    }
    return true;
  }

  async function processWeek(tabId: number, daysInWeek: Day[]) {
    const week = combineWeekData(daysInWeek);

    await fillWeekBericht(tabId, week);
    await rerender(tabId);

    await fillDailyReports(tabId, daysInWeek, week);

    await sleep(2000);
  }

  async function getCurrentTabId() {
    return (await browser.tabs.query({ active: true, currentWindow: true }))[0]
      .id!;
  }

  async function fill(days: Days) {
    const issues: string[] = [];
    error = null;
    isCancelled = false;

    const tabId = await getCurrentTabId();

    if (!(await validateDateRange(days, tabId))) {
      return;
    }

    let daysInWeek: Day[] = [];
    for (let i = 0; i < days.length; i++) {
      if (isCancelled) return;

      const day = days[i];

      if (!(await navigateToCorrectWeek(tabId, day.datum))) {
        return;
      }

      if ((await isBerichtFilled(tabId)) && !shouldOverwrite) continue;

      daysInWeek.push({
        ...day,
        text: parseStringList(day.text ?? ''),
        qualifikationen: processQualifications(day, issues),
      });

      const nextDay = days[i + 1];
      const isEndOfWeek =
        nextDay == undefined ||
        !(await isDateInPageRange(tabId, nextDay.datum));

      if (isEndOfWeek) {
        await processWeek(tabId, daysInWeek);
        daysInWeek = [];
      }
    }

    if (issues.length > 0) {
      error = `Issues found: ${issues.join(', ')}`;
    }
  }

  async function startFilling() {
    if (!parsedData) return;

    loading = true;
    await fill(parsedData);
    loading = false;
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
        onclick={cancelFilling}
        class="disabled:bg-neutral-400 bg-neutral-50 enabled:hover:bg-neutral-200 text-neutral-900 enabled:hover:cursor-pointer px-4 py-1 rounded-sm border-none"
      >
        Abbrechen
      </button>

      {#if isCancelled}
        <p>Ausfüllen wird abgebrochen.</p>
      {/if}
    {:else}
      <button
        disabled={!hasFiles}
        class="disabled:bg-neutral-400 bg-neutral-50 enabled:hover:bg-neutral-200 text-neutral-900 enabled:hover:cursor-pointer px-4 py-1 rounded-sm border-none"
        onclick={startFilling}
      >
        Start
      </button>

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
            onclick={selectFile}
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
    <Checkbox
      label={'Berichte überschreiben?'}
      bind:checked={shouldOverwrite}
    />

    {#if error != null}
      <p class="text-red-400">{error}</p>
    {/if}
  </div>
</main>
