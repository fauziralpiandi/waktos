import { AR_EG } from './ar-eg';
import { AR_SA } from './ar-sa';
import { DE_DE } from './de-de';
import { EN_AU } from './en-au';
import { EN_FM } from './en-fm';
import { EN_JM } from './en-jm';
import { EN_NG } from './en-ng';
import { EN_PG } from './en-pg';
import { EN_TO } from './en-to';
import { EN_US } from './en-us';
import { EN_ZA } from './en-za';
import { ES_AR } from './es-ar';
import { ES_GT } from './es-gt';
import { FR_CD } from './fr-cd';
import { HI_IN } from './hi-in';
import { ID_ID } from './id-id';
import { IT_IT } from './it-it';
import { KK_KZ } from './kk-kz';
import { RU_RU } from './ru-ru';
import { SV_SE } from './sv-se';
import { SW_KE } from './sw-ke';
import { ZH_CN } from './zh-cn';

type LocaleCode =
  | 'ar-EG'
  | 'ar-SA'
  | 'de-DE'
  | 'en-AU'
  | 'en-FM'
  | 'en-JM'
  | 'en-NG'
  | 'en-PG'
  | 'en-TO'
  | 'en-US'
  | 'en-ZA'
  | 'es-AR'
  | 'es-GT'
  | 'fr-CD'
  | 'hi-IN'
  | 'id-ID'
  | 'it-IT'
  | 'kk-KZ'
  | 'ru-RU'
  | 'sv-SE'
  | 'sw-KE'
  | 'zh-CN';

export interface LocaleMessages {
  justNow: string;
  minutesAgo: (count: number) => string;
  hoursAgo: (count: number) => string;
  yesterday: string;
  daysAgo: (count: number) => string;
  lastWeek: string;
  weeksAgo: (count: number) => string;
  lastMonth: string;
  monthsAgo: (count: number) => string;
  lastYear: string;
  yearsAgo: (count: number) => string;
}

const locales: Record<LocaleCode, LocaleMessages> = {
  'ar-EG': AR_EG,
  'ar-SA': AR_SA,
  'de-DE': DE_DE,
  'en-AU': EN_AU,
  'en-FM': EN_FM,
  'en-JM': EN_JM,
  'en-NG': EN_NG,
  'en-PG': EN_PG,
  'en-TO': EN_TO,
  'en-US': EN_US,
  'en-ZA': EN_ZA,
  'es-AR': ES_AR,
  'es-GT': ES_GT,
  'fr-CD': FR_CD,
  'hi-IN': HI_IN,
  'id-ID': ID_ID,
  'it-IT': IT_IT,
  'kk-KZ': KK_KZ,
  'ru-RU': RU_RU,
  'sv-SE': SV_SE,
  'sw-KE': SW_KE,
  'zh-CN': ZH_CN,
};

function normalizeLocale(locale: string): LocaleCode {
  try {
    const canonicalLocale = new Intl.Locale(locale).toString().toLowerCase();
    const normalized = canonicalLocale.replace(/_/g, '-');

    if (locales[normalized as LocaleCode]) {
      return normalized as LocaleCode;
    }

    const language = normalized.split('-')[0];
    const localeKeys = Object.keys(locales) as LocaleCode[];
    const match = localeKeys.find(key =>
      key.toLowerCase().startsWith(language + '-'),
    );

    if (match) {
      return match;
    }
  } catch {
    const fallbackNormalized = locale.toLowerCase().replace(/_/g, '-');
    if (locales[fallbackNormalized as LocaleCode]) {
      return fallbackNormalized as LocaleCode;
    }
  }

  return 'en-US';
}

export function getLocaleMessages(locale: string): LocaleMessages {
  const normalizedLocale = normalizeLocale(locale);
  return locales[normalizedLocale as LocaleCode] ?? EN_US;
}
