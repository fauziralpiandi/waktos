import { addLocale, type Locale } from '.';

const LOCALE: Locale = {
  code: 'zh-CN',
  calendar: {
    labels: {
      weekdays: {
        full: [
          '星期日',
          '星期一',
          '星期二',
          '星期三',
          '星期四',
          '星期五',
          '星期六',
        ],
        abbr: ['周日', '周一', '周二', '周三', '周四', '周五', '周六'],
      },
      months: {
        full: [
          '一月',
          '二月',
          '三月',
          '四月',
          '五月',
          '六月',
          '七月',
          '八月',
          '九月',
          '十月',
          '十一月',
          '十二月',
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
      default: 'YYYY年M月D日dddd H:mm',
      toString: 'YYYY年M月D日 ddd H:mm:ss ZZ',
    },
    relative: {
      past: '[s]前',
      future: '[s]后',
      units: {
        second: { singular: '刚刚', plural: '几秒钟' },
        minute: { singular: '1分钟', plural: '[n]分钟' },
        hour: { singular: '1小时', plural: '[n]小时' },
        day: { singular: '1天', plural: '[n]天' },
        week: { singular: '1周', plural: '[n]周' },
        month: { singular: '1个月', plural: '[n]个月' },
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
