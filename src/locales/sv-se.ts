import { type LocaleMessages } from './index';

export const SV_SE: LocaleMessages = {
  justNow: 'just nu',
  minutesAgo: count => `${count} ${count === 1 ? 'minut' : 'minuter'} sedan`,
  hoursAgo: count => `${count} ${count === 1 ? 'timme' : 'timmar'} sedan`,
  yesterday: 'igår',
  daysAgo: count => `${count} dagar sedan`,
  lastWeek: 'förra veckan',
  weeksAgo: count => `${count} veckor sedan`,
  lastMonth: 'förra månaden',
  monthsAgo: count => `${count} månader sedan`,
  lastYear: 'förra året',
  yearsAgo: count => `${count} år sedan`,
};
