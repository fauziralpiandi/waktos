import { addLocale, type Locale } from '.';

const LOCALE: Locale = {
  code: 'de-DE',
  calendar: {
    labels: {
      weekdays: {
        full: [
          'Sonntag',
          'Montag',
          'Dienstag',
          'Mittwoch',
          'Donnerstag',
          'Freitag',
          'Samstag',
        ],
        abbr: ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'],
      },
      months: {
        full: [
          'Januar',
          'Februar',
          'März',
          'April',
          'Mai',
          'Juni',
          'Juli',
          'August',
          'September',
          'Oktober',
          'November',
          'Dezember',
        ],
        abbr: [
          'Jan',
          'Feb',
          'Mär',
          'Apr',
          'Mai',
          'Jun',
          'Jul',
          'Aug',
          'Sep',
          'Okt',
          'Nov',
          'Dez',
        ],
      },
    },
  },
  format: {
    patterns: {
      default: 'dddd, D. MMMM YYYY [um] HH:mm',
      toString: 'ddd DD.MM.YYYY HH:mm:ss ZZ',
    },
    relative: {
      past: 'vor [s]',
      future: 'in [s]',
      units: {
        second: { singular: 'jetzt', plural: 'ein paar Sekunden' },
        minute: { singular: '1 Minute', plural: '[n] Minuten' },
        hour: { singular: '1 Stunde', plural: '[n] Stunden' },
        day: { singular: '1 Tag', plural: '[n] Tagen' },
        week: { singular: '1 Woche', plural: '[n] Wochen' },
        month: { singular: '1 Monat', plural: '[n] Monaten' },
        year: { singular: '1 Jahr', plural: '[n] Jahren' },
      },
    },
    ordinal: (n: number | string) => {
      return String(n) + '.';
    },
  },
};

addLocale(LOCALE);

export default LOCALE;
