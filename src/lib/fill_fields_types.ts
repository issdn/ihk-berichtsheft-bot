export type Day = {
  datum: string;
  ort: string;
  qualifikationen: (string | number)[];
  text?: string;
  anwesenheit: string;
};

export type Days = Day[];
