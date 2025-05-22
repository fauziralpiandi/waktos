import { type LocaleMessages } from './index';

export const DE_DE: LocaleMessages = {
  justNow: 'gerade eben',
  minutesAgo: count => `vor ${count} ${count === 1 ? 'Minute' : 'Minuten'}`,
  hoursAgo: count => `vor ${count} ${count === 1 ? 'Stunde' : 'Stunden'}`,
  yesterday: 'gestern',
  daysAgo: count => `vor ${count} ${count === 1 ? 'Tag' : 'Tagen'}`,
  lastWeek: 'letzte Woche',
  weeksAgo: count => `vor ${count} ${count === 1 ? 'Woche' : 'Wochen'}`,
  lastMonth: 'letzten Monat',
  monthsAgo: count => `vor ${count} ${count === 1 ? 'Monat' : 'Monaten'}`,
  lastYear: 'letztes Jahr',
  yearsAgo: count => `vor ${count} ${count === 1 ? 'Jahr' : 'Jahren'}`,
};
