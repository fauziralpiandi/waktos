import { type Locale, addLocale } from '.';

const LOCALE: Locale = {
  code: 'hi-IN',
  calendar: {
    labels: {
      weekdays: {
        full: [
          'रविवार',
          'सोमवार',
          'मंगलवार',
          'बुधवार',
          'गुरुवार',
          'शुक्रवार',
          'शनिवार',
        ],
        abbr: ['रवि', 'सोम', 'मंगल', 'बुध', 'गुरु', 'शुक्र', 'शनि'],
      },
      months: {
        full: [
          'जनवरी',
          'फ़रवरी',
          'मार्च',
          'अप्रैल',
          'मई',
          'जून',
          'जुलाई',
          'अगस्त',
          'सितंबर',
          'अक्तूबर',
          'नवंबर',
          'दिसंबर',
        ],
        abbr: [
          'जन॰',
          'फ़र॰',
          'मार्च',
          'अप्रैल',
          'मई',
          'जून',
          'जुल॰',
          'अग॰',
          'सित॰',
          'अक्तू॰',
          'नव॰',
          'दिस॰',
        ],
      },
    },
  },
  format: {
    patterns: {
      date: {
        P: 'D/M/YY',
        PP: 'D MMM YYYY',
        PPP: 'D MMMM YYYY',
        PPPP: 'dddd, D MMMM YYYY',
      },
      time: {
        C: 'h:mm a',
        CC: 'h:mm:ss a',
        CCC: 'h:mm:ss a Z',
        CCCC: 'h:mm:ss a ZZ',
      },
      default: 'dddd, D MMMM YYYY [को] h:mm a',
      toString: 'ddd, D MMMM YYYY h:mm:ss a ZZ',
    },
    relative: {
      past: '[s] पहले',
      future: '[s] में',
      units: {
        second: { singular: 'अभी', plural: 'कुछ सेकंड' },
        minute: { singular: '1 मिनट', plural: '[n] मिनट' },
        hour: { singular: '1 घंटा', plural: '[n] घंटे' },
        day: { singular: '1 दिन', plural: '[n] दिन' },
        week: { singular: '1 सप्ताह', plural: '[n] सप्ताह' },
        month: { singular: '1 महीना', plural: '[n] महीने' },
        year: { singular: '1 साल', plural: '[n] साल' },
      },
    },
    numeral: (n: number | string) => {
      return String(n)
        .split('')
        .map(digit => {
          switch (digit) {
            case '0':
              return '०';
            case '1':
              return '१';
            case '2':
              return '२';
            case '3':
              return '३';
            case '4':
              return '४';
            case '5':
              return '५';
            case '6':
              return '६';
            case '7':
              return '७';
            case '8':
              return '८';
            case '9':
              return '९';
            default:
              return digit;
          }
        })
        .join('');
    },
    ordinal: (n: number | string) => {
      return String(n) + 'वां';
    },
  },
};

addLocale(LOCALE);

export default LOCALE;
