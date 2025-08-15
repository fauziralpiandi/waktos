import { type Locale, addLocale } from '.';

const LOCALE: Locale = {
  code: 'en-US',
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
        P: 'M/DD/YY',
        PP: 'MMM D, YYYY',
        PPP: 'MMMM D, YYYY',
        PPPP: 'dddd, MMMM D, YYYY',
      },
      time: {
        C: 'h:mm A',
        CC: 'h:mm:ss A',
        CCC: 'h:mm:ss A Z',
        CCCC: 'h:mm:ss A ZZ',
      },
      default: 'dddd, MMMM D, YYYY [at] h:mm A',
      toString: 'ddd MMM DD YYYY HH:mm:ss ZZ',
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
