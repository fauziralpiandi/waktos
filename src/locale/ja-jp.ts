import { type Locale, addLocale } from '.';

const LOCALE: Locale = {
  code: 'ja-JP',
  calendar: {
    labels: {
      weekdays: {
        full: [
          '日曜日',
          '月曜日',
          '火曜日',
          '水曜日',
          '木曜日',
          '金曜日',
          '土曜日',
        ],
        abbr: ['日', '月', '火', '水', '木', '金', '土'],
      },
      months: {
        full: [
          '1月',
          '2月',
          '3月',
          '4月',
          '5月',
          '6月',
          '7月',
          '8月',
          '9月',
          '10月',
          '11月',
          '12月',
        ],
        abbr: [
          '1月',
          '2月',
          '3月',
          '4月',
          '5月',
          '6月',
          '7月',
          '8月',
          '9月',
          '10月',
          '11月',
          '12月',
        ],
      },
    },
  },
  format: {
    patterns: {
      date: {
        P: 'YYYY/M/D',
        PP: 'YYYY/M/D',
        PPP: 'YYYY年M月D日',
        PPPP: 'YYYY年M月D日dddd',
      },
      time: {
        C: 'H:mm',
        CC: 'H:mm:ss',
        CCC: 'H:mm:ss Z',
        CCCC: 'H:mm:ss ZZ',
      },
      default: 'YYYY年M月D日dddd H:mm',
      toString: 'YYYY年M月D日(ddd) H:mm:ss ZZ',
    },
    relative: {
      past: '[s]前',
      future: '[s]後',
      units: {
        second: { singular: 'たった今', plural: '数秒' },
        minute: { singular: '1分', plural: '[n]分' },
        hour: { singular: '1時間', plural: '[n]時間' },
        day: { singular: '1日', plural: '[n]日' },
        week: { singular: '1週間', plural: '[n]週間' },
        month: { singular: '1ヶ月', plural: '[n]ヶ月' },
        year: { singular: '1年', plural: '[n]年' },
      },
    },
    ordinal: (n: number | string) => {
      return '第' + String(n);
    },
  },
};

addLocale(LOCALE);

export default LOCALE;
