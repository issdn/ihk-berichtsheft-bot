import { Week, Weeks } from '../lib/fill_fields_types';

declare global {
  interface Window {
    pData: Weeks; // Replace YourDataType with the actual type
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

  // Parse start date
  const [startDay, startMonth, startYear] = startDateStr.split('.');
  const startDate = new Date(`20${startYear}-${startMonth}-${startDay}`);

  // Parse end date
  const [endDay, endMonth, endYear] = endDateStr.split('.');
  const endDate = new Date(`20${endYear}-${endMonth}-${endDay}`);

  // Set times to midnight to compare dates only
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

function save() {
  (
    document.querySelector(
      'button[aria-label="Manuelles Speichern"]'
    ) as HTMLElement
  ).click();
}

function selectCheckboxByLabelText(text: string) {
  // Find the label element containing the desired text
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
    // Get the associated checkbox ID from the 'for' attribute
    const checkboxId = label.getAttribute('for');
    if (checkboxId) {
      // Select the checkbox and check it
      const checkbox = document.getElementById(checkboxId);
      if (checkbox) {
        checkbox.click(); // Click to toggle the checkbox
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
  (
    elementWithSelect.getElementsByTagName('mat-select')[0] as HTMLElement
  ).click();
  await sleep(500);
  (
    document.getElementsByTagName('mat-option')[optionIndex] as HTMLElement
  ).click();
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

export async function fill(data: Weeks) {
  try {
    if (data.length === 0) return false;
    const weeksWithoutCurrent = [];
    let currentWeek: Week | null = null;
    for (const week of data) {
      if (isDateInPageRange(new Date(week.date))) {
        currentWeek = week;
      } else {
        weeksWithoutCurrent.push(week);
      }
    }
    window.pData = weeksWithoutCurrent;
    if (currentWeek === null) return true;
    const isSchool = currentWeek.ort == 'Schule';
    selectOption(document, isSchool ? 0 : 1);
    await sleep(1000);
    insertDescription(currentWeek.description ?? '');
    for (let i = 0; i < 5; i++) {
      await selectOption(
        document.getElementsByClassName(toggleClasses.anwesenheit)[i],
        0
      );
      setHours(i);
      openQualifikationen(i);
      await sleep(500);
      currentWeek.qualifications.forEach((qualification) => {
        selectCheckboxByLabelText(qualification);
      });
      closeDialog();
      await sleep(500);
    }
    // save();
    // await sleep(1000);
    vorherigeWoche();
    await sleep(500);
  } catch (e) {
    if (e instanceof Error) {
      console.log(`${e.message} - Woche überspringen.`);
    } else {
      console.log('Fehler - Woche überspringen.');
    }
    // vorherigeWoche();
    // await sleep(500);
    return false;
  }
  return true;
}

export default defineUnlistedScript(async () => {
  return await fill(window.pData);
});
