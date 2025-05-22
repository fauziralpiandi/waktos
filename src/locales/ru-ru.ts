import { type LocaleMessages } from './index';

export const RU_RU: LocaleMessages = {
  justNow: 'только что',
  minutesAgo: count => {
    // Russian has complex pluralization rules
    if (count % 10 === 1 && count % 100 !== 11) {
      return `${count} минуту назад`;
    } else if (
      [2, 3, 4].includes(count % 10) &&
      ![12, 13, 14].includes(count % 100)
    ) {
      return `${count} минуты назад`;
    } else {
      return `${count} минут назад`;
    }
  },
  hoursAgo: count => {
    if (count % 10 === 1 && count % 100 !== 11) {
      return `${count} час назад`;
    } else if (
      [2, 3, 4].includes(count % 10) &&
      ![12, 13, 14].includes(count % 100)
    ) {
      return `${count} часа назад`;
    } else {
      return `${count} часов назад`;
    }
  },
  yesterday: 'вчера',
  daysAgo: count => {
    if (count % 10 === 1 && count % 100 !== 11) {
      return `${count} день назад`;
    } else if (
      [2, 3, 4].includes(count % 10) &&
      ![12, 13, 14].includes(count % 100)
    ) {
      return `${count} дня назад`;
    } else {
      return `${count} дней назад`;
    }
  },
  lastWeek: 'на прошлой неделе',
  weeksAgo: count => {
    if (count % 10 === 1 && count % 100 !== 11) {
      return `${count} неделю назад`;
    } else if (
      [2, 3, 4].includes(count % 10) &&
      ![12, 13, 14].includes(count % 100)
    ) {
      return `${count} недели назад`;
    } else {
      return `${count} недель назад`;
    }
  },
  lastMonth: 'в прошлом месяце',
  monthsAgo: count => {
    if (count % 10 === 1 && count % 100 !== 11) {
      return `${count} месяц назад`;
    } else if (
      [2, 3, 4].includes(count % 10) &&
      ![12, 13, 14].includes(count % 100)
    ) {
      return `${count} месяца назад`;
    } else {
      return `${count} месяцев назад`;
    }
  },
  lastYear: 'в прошлом году',
  yearsAgo: count => {
    if (count % 10 === 1 && count % 100 !== 11) {
      return `${count} год назад`;
    } else if (
      [2, 3, 4].includes(count % 10) &&
      ![12, 13, 14].includes(count % 100)
    ) {
      return `${count} года назад`;
    } else {
      return `${count} лет назад`;
    }
  },
};
