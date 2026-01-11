import { addLocale, type Locale } from '.';

const LOCALE: Locale = {
  code: 'ar-SA',
  rtl: true,
  calendar: {
    weekStart: 0,
    weekend: [5, 6],
    labels: {
      weekdays: {
        full: [
          'الأحد',
          'الاثنين',
          'الثلاثاء',
          'الأربعاء',
          'الخميس',
          'الجمعة',
          'السبت',
        ],
        abbr: [
          'الأحد',
          'الاثنين',
          'الثلاثاء',
          'الأربعاء',
          'الخميس',
          'الجمعة',
          'السبت',
        ],
      },
      months: {
        full: [
          'يناير',
          'فبراير',
          'مارس',
          'أبريل',
          'مايو',
          'يونيو',
          'يوليو',
          'أغسطس',
          'سبتمبر',
          'أكتوبر',
          'نوفمبر',
          'ديسمبر',
        ],
        abbr: [
          'ينا',
          'فبر',
          'مار',
          'أبر',
          'ماي',
          'يون',
          'يول',
          'أغس',
          'سبت',
          'أكت',
          'نوف',
          'ديس',
        ],
      },
    },
  },
  format: {
    patterns: {
      default: 'dddd، D MMMM YYYY [في] h:mm A',
      toString: 'ddd D MMMM YYYY h:mm:ss A ZZ',
    },
    relative: {
      past: 'قبل [s]',
      future: 'خلال [s]',
      units: {
        second: { singular: 'الآن', plural: 'ثوانٍ قليلة' },
        minute: { singular: 'دقيقة واحدة', plural: '[n] دقائق' },
        hour: { singular: 'ساعة واحدة', plural: '[n] ساعات' },
        day: { singular: 'يوم واحد', plural: '[n] أيام' },
        week: { singular: 'أسبوع واحد', plural: '[n] أسابيع' },
        month: { singular: 'شهر واحد', plural: '[n] أشهر' },
        year: { singular: 'سنة واحدة', plural: '[n] سنوات' },
      },
    },
    numeral: (n: number | string) => {
      // eslint-disable-next-line @typescript-eslint/no-misused-spread
      return [...String(n)]
        .map((digit) => {
          switch (digit) {
            case '0': {
              return '٠';
            }
            case '1': {
              return '١';
            }
            case '2': {
              return '٢';
            }
            case '3': {
              return '٣';
            }
            case '4': {
              return '٤';
            }
            case '5': {
              return '٥';
            }
            case '6': {
              return '٦';
            }
            case '7': {
              return '٧';
            }
            case '8': {
              return '٨';
            }
            case '9': {
              return '٩';
            }
            default: {
              return digit;
            }
          }
        })
        .join('');
    },
    ordinal: (n: number | string) => {
      return String(n) + 'ـ';
    },
  },
};

addLocale(LOCALE);

export default LOCALE;
