import type { Locale } from 'date-fns';
import { pl, enUS } from 'date-fns/locale';

export interface CurrencyFormat {
  symbol: string;
  position: 'before' | 'after';
  decimal: string;
  thousand: string;
}

export interface Language {
  code: string;
  name: string;
  flag: string;
  dateFormat: string;
  dateFnsLocale: Locale;
  currencyFormat: CurrencyFormat;
}

export const SUPPORTED_LANGUAGES: Language[] = [
  {
    code: 'pl',
    name: 'Polski',
    flag: '🇵🇱',
    dateFormat: 'dd.MM.yyyy',
    dateFnsLocale: pl,
    currencyFormat: {
      symbol: 'zł',
      position: 'after',
      decimal: ',',
      thousand: '\u00A0',
    },
  },
  {
    code: 'en',
    name: 'English',
    flag: '🇬🇧',
    dateFormat: 'MM/dd/yyyy',
    dateFnsLocale: enUS,
    currencyFormat: {
      symbol: '$',
      position: 'before',
      decimal: '.',
      thousand: ',',
    },
  },
];

export const DEFAULT_LANGUAGE = 'pl';
export const FALLBACK_LANGUAGE = 'en';
export const LANGUAGE_STORAGE_KEY = 'pms_language';
