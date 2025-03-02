import { Day } from './fill_fields_types';

export const qualifikationenByNr = new Map(
  Object.entries({
    'Allgemeinbildende Fächer': 49,
    'Arbeitsplätze nach Kundenwunsch ausstatten': 29,
    'Benutzerschnittstellen gestalten und entwickeln': 37,
    'Clients in Netzwerke einbinden': 30,
    'Cyber-physische Systeme ergänzen': 34,
    'Das Unternehmen und die eigene Rolle im Betrieb beschreiben': 28,
    'Daten systemübergreifend bereitstellen': 35,
    'Funktionalität in Anwendungen realisieren': 38,
    'Kundenspezifische Anwendungsentwicklung durchführen': 39,
    'Netzwerke und Dienste bereitstellen': 36,
    'Schutzbedarfsanalyse im eigenen Arbeitsbereich durchführen': 31,
    'Serviceanfragen bearbeiten': 33,
    'Software zur Verwaltung von Daten anpassen': 32,
    'Aufbau und Organisation des Ausbildungsbetriebes': 24,
    'Berufsbildung sowie Arbeits- und Tarifrecht': 23,
    'Betreiben von IT-Systemen': 8,
    'Beurteilen marktgängiger IT-Systeme und kundenspezifischer Lösungen': 3,
    'Durchführen und Dokumentieren von qualitätssichernden Maßnahmen': 5,
    'Entwickeln, Erstellen und Betreuen von IT-Lösungen': 4,
    'Erbringen der Leistungen und Auftragsabschluss': 7,
    'Inbetriebnehmen von Speicherlösungen': 9,
    'Informieren und Beraten von Kunden und Kundinnen': 2,
    'Konzipieren und Umsetzen von kundenspezifischen Softwareanwendungen': 11,
    'Planen, Vorbereiten und Durchführen von Arbeitsaufgaben in Abstimmung mit den kundenspezifischen Geschäfts- und Leistungsprozessen': 1,
    'Programmieren von Softwarelösungen': 10,
    'Sicherheit und Gesundheitsschutz bei der Arbeit': 25,
    'Sicherstellen der Qualität von Softwareanwendungen': 12,
    'Sonstige Qualifikation': 50,
    'Umsetzen, Integrieren und Prüfen von Maßnahmen zur IT-Sicherheit und zum Datenschutz': 6,
    Umweltschutz: 26,
    'Vernetztes Zusammenarbeiten unter Nutzung digitaler Medien': 27,
  })
);
declare global {
  interface Window {
    currentWeek: Day;
    ng: any;
  }
}

export class FillException extends Error {}

export const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function rerender(tabId: number) {
  await browser.scripting.executeScript<[], void>({
    target: { tabId },
    func: () => {
      (Array.from(document.querySelectorAll('a.mdc-tab')) as HTMLElement[])
        .find((e) => e.innerText == 'Einträge auf Wochenbasis anlegen')
        ?.click();
    },
  });
}

export async function vorherigeWoche(tabId: number) {
  await browser.scripting.executeScript<[], void>({
    target: { tabId },
    func: () => {
      (
        document.querySelector('a[aria-label="Vorherige Woche"]') as HTMLElement
      ).click();
    },
  });
}

export async function getPageDates(tabId: number) {
  return (
    await browser.scripting.executeScript<[], [string, string]>({
      target: { tabId },
      world: 'MAIN',
      func: () => {
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
      },
    })
  )[0].result!.map((dateStr) => {
    const date = new Date(dateStr);
    date.setHours(0, 0, 0);
    return date;
  });
}

export async function trySave(tabId: number) {
  const res = await browser.scripting.executeScript({
    target: { tabId },
    world: 'MAIN',
    func: () => {
      const saveBtn = document.querySelector(
        'button[aria-label="Manuelles Speichern"]'
      );
      if (saveBtn != null) {
        (saveBtn as HTMLButtonElement).click();
        return true;
      }
    },
  });
  return res[0].result ?? false;
}

export async function fillDayBericht(
  tabId: number,
  day: Omit<Day, 'datum' | 'text'>,
  index: number
) {
  await browser.scripting.executeScript<
    [Omit<Day, 'datum' | 'text'>, number],
    void
  >({
    target: { tabId },
    world: 'MAIN',
    func: ({ qualifikationen, anwesenheit }, index) => {
      const nodeFormGroupControls = window.ng.core.getDebugNode(
        document.querySelectorAll('lib-spb-berichtsheft-tages-bericht-kompakt')[
          index
        ]
      ).componentInstance.tagesBerichtFormGroup.controls;
      nodeFormGroupControls.anwesenheit.setValue(anwesenheit);
      const eintragControls =
        nodeFormGroupControls.eintraege.controls[0].controls;
      eintragControls.dauer.setValue('PT8H');
      eintragControls.qualifikationen.setValue([49]);
    },
    args: [day, index],
  });
}

export async function fillWeekBericht(tabId: number, week: Day) {
  await browser.scripting.executeScript<[Day], void>({
    target: { tabId },
    world: 'MAIN',
    func: ({ ort, text }) => {
      const controls = window.ng.core.getDebugNode(
        document.querySelector('lib-spb-berichtsheft-wocheneintrag')
      ).componentInstance.wochenEintragFormGroup.controls;
      controls.ort.setValue(ort);
      controls[ort.toLowerCase()].setValue({
        text: text,
        textMitKommentaren: text,
        ort: ort,
        bilderUrls: null,
        typus: 'FreitextEintrag',
      });
    },
    args: [week],
  });
}

export async function getDay(tabId: number, index: number) {
  const res = await browser.scripting.executeScript<[number], Date>({
    target: { tabId },
    world: 'MAIN',
    args: [index],
    func: (index) => {
      const nodeFormGroupControls = window.ng.core.getDebugNode(
        document.querySelectorAll('lib-spb-berichtsheft-tages-bericht-kompakt')[
          index
        ]
      ).componentInstance.tagesBerichtFormGroup.controls;
      return nodeFormGroupControls.datum.value;
    },
  });
  return new Date(res[0].result!);
}
