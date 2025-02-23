import { Week } from './fill_fields_types';

declare global {
  interface Window {
    currentWeek: Week;
  }
}

export class FillException extends Error {}

const toggleClasses = {
  anwesenheit: 'auswahl-anwesenheit',
  ort: 'auswahl-ort',
};

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

export const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

function closeDialog() {
  document
    .getElementsByTagName('mat-dialog-actions')[0]
    .getElementsByTagName('button')[0]
    .click();
}

export async function selectOption(
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

export async function fillWeek(week: Week) {
  try {
    for (let i = 0; i < 5; i++) {
      await selectOption(
        document.getElementsByClassName('auswahl-anwesenheit')[i],
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

export function getPageDates() {
  const smallTag = document.querySelector(
    'h2#berichtsheft-woche-navigation small'
  );

  const dateRangeText = smallTag!.textContent!.trim();
  const [startDateStr, endDateStr] = dateRangeText.split(' - ');

  const [startDay, startMonth, startYear] = startDateStr.split('.');
  const startDate = `20${startYear}-${startMonth}-${startDay}`;

  const [endDay, endMonth, endYear] = endDateStr.split('.');
  const endDate = `20${endYear}-${endMonth}-${endDay}`;

  return [startDate, endDate];
}
