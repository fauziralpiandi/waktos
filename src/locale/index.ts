type RelativeUnit =
  | 'second'
  | 'minute'
  | 'hour'
  | 'day'
  | 'week'
  | 'month'
  | 'year';

type Hour =
  | 0
  | 1
  | 2
  | 3
  | 4
  | 5
  | 6
  | 7
  | 8
  | 9
  | 10
  | 11
  | 12
  | 13
  | 14
  | 15
  | 16
  | 17
  | 18
  | 19
  | 20
  | 21
  | 22
  | 23
  | 24;

type Weekday = 0 | 1 | 2 | 3 | 4 | 5 | 6;

interface Locale {
  code: string;
  rtl?: boolean;
  calendar: {
    weekStart?: Weekday;
    weekend?: Weekday[];
    labels: {
      weekdays: { full: string[]; abbr: string[] };
      months: { full: string[]; abbr: string[] };
    };
    periods?: {
      timeOfDay: {
        ranges: { start: Hour; end: Hour; label: string }[];
      };
    };
  };
  format: {
    patterns: {
      date: { P: string; PP: string; PPP: string; PPPP: string };
      time: { C: string; CC: string; CCC: string; CCCC: string };
      default: string;
      toString: string;
    };
    relative: {
      past: string;
      future: string;
      units: Record<RelativeUnit, { singular: string; plural: string }>;
    };
    numeral?: (n: number | string) => string;
    ordinal?: (n: number | string) => string;
  };
}

declare global {
  var __WAKTOS_LOCALE__: Map<string, Locale> | undefined;
}

interface GlobalWithLocaleMap {
  __WAKTOS_LOCALE__?: Map<string, Locale>;
}

const getGlobalScope = (): GlobalWithLocaleMap => {
  if (typeof globalThis !== 'undefined')
    return globalThis as GlobalWithLocaleMap;
  if (typeof global !== 'undefined') return global as GlobalWithLocaleMap;

  return {};
};

const createLocaleRegistry = (): Map<string, Locale> => {
  const scope = getGlobalScope();

  scope.__WAKTOS_LOCALE__ ??= new Map<string, Locale>();

  return scope.__WAKTOS_LOCALE__;
};

const LOCALE_REGISTRY = createLocaleRegistry();

const addLocale = (locale: Locale): void => {
  const code = normalizeLocaleCode(locale.code);

  locale.code = code;
  LOCALE_REGISTRY.set(code, locale);
};

/**
 * Normalizes locale codes to standard format (en-US, de-DE, etc).
 * Handles fallbacks and ensures consistent casing.
 */
const normalizeLocaleCode = (code: string | null | undefined): string => {
  const [language, region] = (code ?? 'en-US').split('-', 2);
  const lowerLanguage = language.toLowerCase();

  return region ? `${lowerLanguage}-${region.toUpperCase()}` : lowerLanguage;
};

const getLocale = (code?: string | null): Locale | undefined => {
  const normalized = normalizeLocaleCode(code);

  return (
    LOCALE_REGISTRY.get(normalized) ??
    LOCALE_REGISTRY.get(normalized.split('-')[0]) ??
    LOCALE_REGISTRY.get('en-US')
  );
};

export type { Locale, RelativeUnit, Weekday };
export { addLocale, getLocale };
