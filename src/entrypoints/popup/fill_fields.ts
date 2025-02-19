class FillException extends Error {}

const qualifikationen = {
  allgemein: 'Allgemeinbildende Fächer',
  plaetzeAusstatten: 'Arbeitsplätze nach Kundenwunsch ausstatten',
  schnittstellen: 'Benutzerschnittstellen gestalten und entwickeln',
  clientsEinbinden: 'Clients in Netzwerke einbinden',
  cpsErgaenzen: 'Cyber-physische Systeme ergänzen',
  betriebRolleBeschreiben:
    'Das Unternehmen und die eigene Rolle im Betrieb beschreiben',
  datenBereitsstellen: 'Daten systemübergreifend bereitstellen',
  anwendungenRealisieren: 'Funktionalität in Anwendungen realisieren',
  entwicklung: 'Kundenspezifische Anwendungsentwicklung durchführen',
  netzwerkeBereitsstellen: 'Netzwerke und Dienste bereitstellen',
  sba: 'Schutzbedarfsanalyse im eigenen Arbeitsbereich durchführen',
  service: 'Serviceanfragen bearbeiten',
  datenVerwaltung: 'Software zur Verwaltung von Daten anpassen',
};

const qualifikationenBetrieb = {
  ausbildungsbetrieb: 'Aufbau und Organisation des Ausbildungsbetriebes',
  berufsbildung: 'Berufsbildung sowie Arbeits- und Tarifrecht',
  itSystemeBetreiben: 'Betreiben von IT-Systemen',
  itSystemeBeurteilen:
    'Beurteilen marktgängiger IT-Systeme und kundenspezifischer Lösungen',
  qualitaetssicherung:
    'Durchführen und Dokumentieren von qualitätssichernden Maßnahmen',
  itLoesungenEntwickeln: 'Entwickeln, Erstellen und Betreuen von IT-Lösungen',
  leistungenErbringen: 'Erbringen der Leistungen und Auftragsabschluss',
  speicherloesungenInbetriebnehmen: 'Inbetriebnehmen von Speicherlösungen',
  kundenBeraten: 'Informieren und Beraten von Kunden und Kundinnen',
  softwareKonzipieren:
    'Konzipieren und Umsetzen von kundenspezifischen Softwareanwendungen',
  arbeitsaufgabenPlanen:
    'Planen, Vorbereiten und Durchführen von Arbeitsaufgaben in Abstimmung mit den kundenspezifischen Geschäfts- und Leistungsprozessen',
  softwareProgrammieren: 'Programmieren von Softwarelösungen',
  arbeitsschutz: 'Sicherheit und Gesundheitsschutz bei der Arbeit',
  softwareQualitaet: 'Sicherstellen der Qualität von Softwareanwendungen',
  sonstigeQualifikation: 'Sonstige Qualifikation',
  itSicherheit:
    'Umsetzen, Integrieren und Prüfen von Maßnahmen zur IT-Sicherheit und zum Datenschutz',
  umweltschutz: 'Umweltschutz',
  zusammenarbeitDigital:
    'Vernetztes Zusammenarbeiten unter Nutzung digitaler Medien',
};

const toggleClasses = {
  anwesenheit: 'auswahl-anwesenheit',
  ort: 'auswahl-ort',
};

const dateRanges = {
  schoolMonths: [
    { start: '2025-01-01', end: '2025-03-31' },
    { start: '2025-07-01', end: '2025-09-30' },
  ],
  workMonths: [
    { start: '2025-04-01', end: '2025-06-30' },
    { start: '2025-10-01', end: '2025-12-31' },
  ],
};

function getEarliestWeekStart() {
  // Extract all start dates from school and work months
  const allStartDates = [
    ...dateRanges.schoolMonths.map((range) => new Date(range.start)),
    ...dateRanges.workMonths.map((range) => new Date(range.start)),
  ];

  // Find the earliest date
  const earliestDate = new Date(
    Math.min(...allStartDates.map((date) => date.getTime()))
  );

  return earliestDate; // Format as YYYY-MM-DD
}

function isDateInRange(date: Date, ranges: { start: string; end: string }[]) {
  return ranges.some((range) => {
    const startDate = new Date(range.start);
    const endDate = new Date(range.end);
    return date >= startDate && date <= endDate;
  });
}

function getPageDate() {
  const smallTag = document.querySelector(
    'h2#berichtsheft-woche-navigation small'
  );
  if (smallTag == null || smallTag.textContent == null)
    throw new FillException('Kein Datum-Label gefunden.');

  const dateRangeText = smallTag.textContent.trim();
  const [startDate] = dateRangeText.split(' - ');

  // Convert "17.02.25" into "2025-02-17"
  const [day, month, year] = startDate.split('.');

  return new Date(`20${year}-${month}-${day}`);
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

export async function fill() {
  try {
    const pageDate = getPageDate();
    const earliestPossible = getEarliestWeekStart();
    console.log(
      `Datum der aktuellen Seite: ${pageDate.toISOString()}\nAusfüllen bis: ${earliestPossible.toISOString()}`
    );
    if (pageDate < earliestPossible) return false;
    const isSchool = isDateInRange(pageDate, dateRanges.schoolMonths);
    selectOption(document, isSchool ? 0 : 1);
    await sleep(500);
    for (let i = 0; i < 5; i++) {
      await selectOption(
        document.getElementsByClassName(toggleClasses.anwesenheit)[i],
        0
      );
      setHours(i);
      openQualifikationen(i);
      await sleep(500);
      selectCheckboxByLabelText(
        isSchool
          ? qualifikationen.allgemein
          : qualifikationenBetrieb.softwareProgrammieren
      );
      closeDialog();
      await sleep(500);
    }
    // save()
    // await sleep(1000);
    vorherigeWoche();
    await sleep(500);
  } catch (e) {
    if (e instanceof Error) {
      console.log(`${e.message} - Woche überspringen.`);
    } else {
      console.log('Fehler - Woche überspringen.');
    }
    vorherigeWoche();
    await sleep(500);
  }
  return true;
}
