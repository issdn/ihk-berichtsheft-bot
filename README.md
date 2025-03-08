### Installation:
1. ZIP Herunterladen
2. Unzippen
3. Upload 
  - Edge: ![edge](https://github.com/user-attachments/assets/75eddcc6-1ba8-4fa7-abdd-dc94ff769db4)
  - Chrome: ![chrome](https://github.com/user-attachments/assets/0bbdf356-8165-4280-aa5c-a46f4571a387)

### JSON Beispiel:
```json
[
  {
    "datum": "2024-12-11",
    "ort": "BETRIEB",
    "anwesenheit": "ANWESEND",
    "qualifikationen": [
      "Programmieren von Softwarelösungen",
      "Sicherstellen der Qualität von Softwareanwendungen"
    ],
    "text": "- FIX: 123\n - Commit Blablabla"
  },
]
```

### JSON Typ:
```ts
Day = {
  datum: string;
  ort: string;
  qualifikationen: (string | number)[];
  text?: string;
  anwesenheit: string;
}
```

### Qualifikationen - Schule (Name : ID)
```json
{
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
    'Software zur Verwaltung von Daten anpassen': 32
}
```

### Qualifikationen - Betrieb / Unterweisung
```json
{
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
    'Vernetztes Zusammenarbeiten unter Nutzung digitaler Medien': 27
}
```
