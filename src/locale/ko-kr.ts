import { addLocale, type Locale } from '.';

const LOCALE: Locale = {
  code: 'ko-KR',
  calendar: {
    labels: {
      weekdays: {
        full: [
          '일요일',
          '월요일',
          '화요일',
          '수요일',
          '목요일',
          '금요일',
          '토요일',
        ],
        abbr: ['일', '월', '화', '수', '목', '금', '토'],
      },
      months: {
        full: [
          '1월',
          '2월',
          '3월',
          '4월',
          '5월',
          '6월',
          '7월',
          '8월',
          '9월',
          '10월',
          '11월',
          '12월',
        ],
        abbr: [
          '1월',
          '2월',
          '3월',
          '4월',
          '5월',
          '6월',
          '7월',
          '8월',
          '9월',
          '10월',
          '11월',
          '12월',
        ],
      },
    },
  },
  format: {
    patterns: {
      default: 'YYYY년 M월 D일 dddd A h:mm',
      toString: 'YYYY년 M월 D일 ddd H:mm:ss ZZ',
    },
    relative: {
      past: '[s] 전',
      future: '[s] 후',
      units: {
        second: { singular: '방금', plural: '몇 초' },
        minute: { singular: '1분', plural: '[n]분' },
        hour: { singular: '1시간', plural: '[n]시간' },
        day: { singular: '1일', plural: '[n]일' },
        week: { singular: '1주', plural: '[n]주' },
        month: { singular: '1개월', plural: '[n]개월' },
        year: { singular: '1년', plural: '[n]년' },
      },
    },
    ordinal: (n: number | string) => {
      return '제' + String(n);
    },
  },
};

addLocale(LOCALE);

export default LOCALE;
