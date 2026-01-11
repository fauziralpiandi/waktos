import { addLocale, type Locale } from '.';

const LOCALE: Locale = {
  code: 'ru-RU',
  calendar: {
    labels: {
      weekdays: {
        full: [
          'воскресенье',
          'понедельник',
          'вторник',
          'среда',
          'четверг',
          'пятница',
          'суббота',
        ],
        abbr: ['вс', 'пн', 'вт', 'ср', 'чт', 'пт', 'сб'],
      },
      months: {
        full: [
          'январь',
          'февраль',
          'март',
          'апрель',
          'май',
          'июнь',
          'июль',
          'август',
          'сентябрь',
          'октябрь',
          'ноябрь',
          'декабрь',
        ],
        abbr: [
          'янв.',
          'февр.',
          'март',
          'апр.',
          'май',
          'июнь',
          'июль',
          'авг.',
          'сент.',
          'окт.',
          'нояб.',
          'дек.',
        ],
      },
    },
  },
  format: {
    patterns: {
      default: 'dddd, D MMMM YYYY [г.] [в] HH:mm',
      toString: 'ddd DD MMM YYYY [г.] HH:mm:ss ZZ',
    },
    relative: {
      past: '[s] назад',
      future: 'через [s]',
      units: {
        second: { singular: 'сейчас', plural: 'несколько секунд' },
        minute: { singular: '1 минуту', plural: '[n] минут' },
        hour: { singular: '1 час', plural: '[n] часов' },
        day: { singular: '1 день', plural: '[n] дней' },
        week: { singular: '1 неделю', plural: '[n] недель' },
        month: { singular: '1 месяц', plural: '[n] месяцев' },
        year: { singular: '1 год', plural: '[n] лет' },
      },
    },
    ordinal: (n: number | string) => {
      return String(n) + '-й';
    },
  },
};

addLocale(LOCALE);

export default LOCALE;
