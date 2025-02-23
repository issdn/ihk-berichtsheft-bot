import { Week, Weeks } from '../lib/fill_fields_types';

declare global {
  interface Window {
    pData: Weeks;
  }
}

class FillException extends Error {}

const toggleClasses = {
  anwesenheit: 'auswahl-anwesenheit',
  ort: 'auswahl-ort',
};

function isDateInPageRange(targetDate: Date) {
  const smallTag = document.querySelector(
    'h2#berichtsheft-woche-navigation small'
  );
  if (smallTag == null || smallTag.textContent == null)
    throw new FillException('Kein Datum-Label gefunden.');

  const dateRangeText = smallTag.textContent.trim();
  const [startDateStr, endDateStr] = dateRangeText.split(' - ');

  const [startDay, startMonth, startYear] = startDateStr.split('.');
  const startDate = new Date(`20${startYear}-${startMonth}-${startDay}`);

  const [endDay, endMonth, endYear] = endDateStr.split('.');
  const endDate = new Date(`20${endYear}-${endMonth}-${endDay}`);

  startDate.setHours(0, 0, 0, 0);
  endDate.setHours(0, 0, 0, 0);
  targetDate.setHours(0, 0, 0, 0);

  return targetDate >= startDate && targetDate <= endDate;
}

function setHours(timepickerIndex = 0) {
  document
    .getElementsByTagName('lib-spb-timepicker')
    [timepickerIndex].getElementsByTagName('input')[0].value = '08';
}

function openQualifikationen(index: number) {
  (
    document.querySelectorAll('button[aria-label="Qualifikationen"]')[
      index
    ] as HTMLElement
  ).click();
}

function selectCheckboxByLabelText(text: string) {
  const label = Array.from(document.querySelectorAll('label.mdc-label')).find(
    (label) => {
      const labelText = label.textContent;
      if (labelText == null || labelText === undefined)
        throw new FillException(
          'Kein Checkbox mit gegebenem Qualifikationstext gefunden.'
        );
      return labelText.trim() === text;
    }
  );

  if (label) {
    const checkboxId = label.getAttribute('for');
    if (checkboxId) {
      const checkbox = document.getElementById(checkboxId);
      if (checkbox) {
        checkbox.click();
      }
    }
  }
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

function closeDialog() {
  document
    .getElementsByTagName('mat-dialog-actions')[0]
    .getElementsByTagName('button')[0]
    .click();
}

async function selectOption(
  elementWithSelect: Element | Document,
  optionIndex: number
) {
  const select = elementWithSelect.getElementsByTagName(
    'mat-select'
  )[0] as HTMLElement;
  if (select != null) {
    select.click();
    await sleep(500);
    (
      document.getElementsByTagName('mat-option')[optionIndex] as HTMLElement
    ).click();
  }
}

function vorherigeWoche() {
  const vorherigeWocheButton = document.querySelector(
    'a[aria-label="Vorherige Woche"]'
  );
  if (vorherigeWocheButton == null || vorherigeWocheButton === undefined) {
    throw new FillException('Vorherige-Woche button nicht gefunden.');
  }
  (vorherigeWocheButton as HTMLElement).click();
}

function insertDescription(text: string) {
  const editor = document.querySelector('.ck-editor__editable') as any | null;
  editor.ckeditorInstance.setData(text);
}

async function fillWeek(week: Week) {
  try {
    const isSchool = week.ort == 'Schule';
    selectOption(document, isSchool ? 0 : 1);
    await sleep(1000);
    insertDescription(week.description ?? '');
    for (let i = 0; i < 5; i++) {
      await selectOption(
        document.getElementsByClassName(toggleClasses.anwesenheit)[i],
        0
      );
      setHours(i);
      openQualifikationen(i);
      await sleep(500);
      Object.values(week.qualifications).forEach((qualification) => {
        selectCheckboxByLabelText(qualification);
      });
      closeDialog();
      await sleep(500);
    }
  } catch (e) {
    if (e instanceof Error) {
      console.log(`${e.message} - Woche überspringen.`);
    } else {
      console.log('Fehler - Woche überspringen.');
    }
  }
}

function sortWeeks(entries: Weeks) {
  return [...entries].sort((a, b) => {
    const dateA = new Date(a.date);
    const dateB = new Date(b.date);
    return dateB.getTime() - dateA.getTime();
  });
}

export async function fill(data: Weeks) {
  data = Object.values(data);
  const sorted = sortWeeks(data);
  for (const week of sorted) {
    while (!isDateInPageRange(new Date(week.date))) {
      vorherigeWoche();
      await sleep(500);
    }
    await fillWeek(week);
    await sleep(2000);
  }
}

export default defineUnlistedScript(async () => {
  return await fill(window.pData);
});
