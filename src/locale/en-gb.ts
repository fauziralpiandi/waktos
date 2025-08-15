import { type Locale, addLocale } from '.';

const LOCALE: Locale = {
  code: 'en-GB',
  calendar: {
    labels: {
      weekdays: {
        full: [
          'Sunday',
          'Monday',
          'Tuesday',
          'Wednesday',
          'Thursday',
          'Friday',
          'Saturday',
        ],
        abbr: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
      },
      months: {
        full: [
          'January',
          'February',
          'March',
          'April',
          'May',
          'June',
          'July',
          'August',
          'September',
          'October',
          'November',
          'December',
        ],
        abbr: [
          'Jan',
          'Feb',
          'Mar',
          'Apr',
          'May',
          'Jun',
          'Jul',
          'Aug',
          'Sep',
          'Oct',
          'Nov',
          'Dec',
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
        PPPP: 'dddd D MMMM YYYY',
      },
      time: {
        C: 'HH:mm',
        CC: 'HH:mm:ss',
        CCC: 'HH:mm:ss Z',
        CCCC: 'HH:mm:ss ZZ',
      },
      default: 'dddd D MMMM YYYY [at] HH:mm',
      toString: 'ddd DD MMM YYYY HH:mm:ss ZZ',
    },
    relative: {
      past: '[s] ago',
      future: 'in [s]',
      units: {
        second: { singular: 'now', plural: 'a few seconds' },
        minute: { singular: 'a minute', plural: '[n] minutes' },
        hour: { singular: 'an hour', plural: '[n] hours' },
        day: { singular: 'a day', plural: '[n] days' },
        week: { singular: 'a week', plural: '[n] weeks' },
        month: { singular: 'a month', plural: '[n] months' },
        year: { singular: 'a year', plural: '[n] years' },
      },
    },
    ordinal: (n: number | string) => {
      const s = ['th', 'st', 'nd', 'rd'];
      const v = Number(n) % 100;

      return String(n) + (s[(v - 20) % 10] || s[v] || s[0]);
    },
  },
};

addLocale(LOCALE);

export default LOCALE;
