import { Day } from './fill_fields_types';

declare global {
  interface Window {
    currentWeek: Day;
    ng: any;
  }
}

export class FillException extends Error {}

function setHours(timepickerIndex = 0) {
  const timeInput = document
    .getElementsByTagName('lib-spb-timepicker')
    [timepickerIndex].getElementsByTagName('ngx-mat-timepicker-field')[0];
  try {
    window.ng.core.getDebugNode(timeInput).componentInstance.changeHour(8);
  } catch (_) {}
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

async function trySave() {
  const saveBtn = document.querySelector(
    'button[aria-label="Manuelles Speichern"]'
  );
  if (saveBtn != null) {
    (saveBtn as HTMLButtonElement).click();
    await sleep(1500);
  }
}

export async function selectOption(
  elementWithSelect: Element | Document,
  optionIndex: number
) {
  const select = elementWithSelect.getElementsByTagName(
    'mat-select'
  )[0] as HTMLElement;
  if (select.querySelector('.mat-mdc-select-value-text') != null) return true;
  if (select != null) {
    select.click();
    await sleep(500);
    (
      document.getElementsByTagName('mat-option')[optionIndex] as HTMLElement
    ).click();
  }
}

export async function fillDay(week: Day) {
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
    await trySave();
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
