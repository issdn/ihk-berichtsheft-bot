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
