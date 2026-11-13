import type { Level } from './game';

export const LANGS = ['en', 'hr'] as const;
export type Lang = (typeof LANGS)[number];
export type Language = 'auto' | Lang;

// Each language's name in that language, for the picker.
export const LANG_NAMES: Record<Lang, string> = {
  en: 'English',
  hr: 'Hrvatski',
};

export function detectLang(): Lang {
  const preferred = navigator.languages ?? [navigator.language];
  return preferred.some((l) => l.toLowerCase().startsWith('hr')) ? 'hr' : 'en';
}

const en = {
  title: 'Rings',
  newGame: 'New game',
  settings: 'Settings',
  close: 'Close',
  levels: {
    easy: 'Easy',
    medium: 'Medium',
    hard: 'Hard',
  } as Record<Level, string>,
  levelNotes: { easy: '2 rings', medium: '3 rings', hard: '4 rings' } as Record<
    Level,
    string
  >,
  peg: 'Peg',
  goalPeg: 'Peg with the star',
  undo: 'Undo',
  startOver: 'Start over',
  solved: 'Well done!',
  next: 'Next',
  changeLevel: 'Change level',
  language: 'Language',
  automatic: 'Automatic',
  sound: 'Sound and vibration',
  on: 'On',
  off: 'Off',
  statistics: 'Statistics',
  solvedColumn: 'Solved',
  allGames: 'All games',
  source: 'Source',
  version: 'Version',
};

export type Strings = typeof en;

const hr: Strings = {
  title: 'Prsteni',
  newGame: 'Nova igra',
  settings: 'Postavke',
  close: 'Zatvori',
  levels: {
    easy: 'Lagano',
    medium: 'Srednje',
    hard: 'Teško',
  },
  levelNotes: { easy: '2 prstena', medium: '3 prstena', hard: '4 prstena' },
  peg: 'Štap',
  goalPeg: 'Štap sa zvjezdicom',
  undo: 'Poništi',
  startOver: 'Ispočetka',
  solved: 'Bravo!',
  next: 'Dalje',
  changeLevel: 'Promijeni razinu',
  language: 'Jezik',
  automatic: 'Automatski',
  sound: 'Zvuk i vibracija',
  on: 'Uključeno',
  off: 'Isključeno',
  statistics: 'Statistika',
  solvedColumn: 'Riješeno',
  allGames: 'Sve igre',
  source: 'Izvorni kod',
  version: 'Verzija',
};

export const STRINGS: Record<Lang, Strings> = { en, hr };
