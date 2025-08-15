import { type Locale, addLocale } from '.';

const LOCALE: Locale = {
  code: 'su-ID',
  calendar: {
    labels: {
      weekdays: {
        full: ['Minggu', 'Senén', 'Salasa', 'Rebo', 'Kemis', 'Jumaah', 'Saptu'],
        abbr: ['Min', 'Sen', 'Sal', 'Reb', 'Kem', 'Jum', 'Sap'],
      },
      months: {
        full: [
          'Januari',
          'Pébruari',
          'Maret',
          'April',
          'Méi',
          'Juni',
          'Juli',
          'Agustus',
          'Séptémber',
          'Oktober',
          'Nopémber',
          'Désémber',
        ],
        abbr: [
          'Jan',
          'Péb',
          'Mar',
          'Apr',
          'Méi',
          'Jun',
          'Jul',
          'Ags',
          'Sép',
          'Okt',
          'Nop',
          'Dés',
        ],
      },
    },
    periods: {
      timeOfDay: {
        ranges: [
          { start: 0, end: 5, label: 'tengah peuting' },
          { start: 5, end: 10, label: 'isuk-isuk' },
          { start: 10, end: 15, label: 'beurang' },
          { start: 15, end: 18, label: 'sore' },
          { start: 18, end: 24, label: 'peuting' },
        ],
      },
    },
  },
  format: {
    patterns: {
      date: {
        P: 'DD/MM/YY',
        PP: 'D MMM YYYY',
        PPP: 'D MMMM YYYY',
        PPPP: 'dddd, D MMMM YYYY',
      },
      time: {
        C: 'HH.mm',
        CC: 'HH.mm.ss',
        CCC: 'HH.mm.ss Z',
        CCCC: 'HH.mm.ss ZZ',
      },
      default: 'dddd, D MMMM YYYY [jam] HH.mm',
      toString: 'ddd DD MMM YYYY HH.mm.ss ZZ',
    },
    relative: {
      past: '[s] saacanna',
      future: 'dina [s]',
      units: {
        second: { singular: 'ayeuna', plural: 'sababaraha detik' },
        minute: { singular: 'samenit', plural: '[n] menit' },
        hour: { singular: 'sajam', plural: '[n] jam' },
        day: { singular: 'sapoé', plural: '[n] poé' },
        week: { singular: 'saminggu', plural: '[n] minggu' },
        month: { singular: 'sabulan', plural: '[n] bulan' },
        year: { singular: 'sataun', plural: '[n] taun' },
      },
    },
    ordinal: (n: number | string) => {
      return 'ka-' + String(n);
    },
  },
};

addLocale(LOCALE);

export default LOCALE;
