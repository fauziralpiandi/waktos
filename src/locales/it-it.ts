import { type LocaleMessages } from './index';

export const IT_IT: LocaleMessages = {
  justNow: 'proprio ora',
  minutesAgo: count => `${count} ${count === 1 ? 'minuto' : 'minuti'} fa`,
  hoursAgo: count => `${count} ${count === 1 ? 'ora' : 'ore'} fa`,
  yesterday: 'ieri',
  daysAgo: count => `${count} giorni fa`,
  lastWeek: 'la settimana scorsa',
  weeksAgo: count => `${count} settimane fa`,
  lastMonth: 'il mese scorso',
  monthsAgo: count => `${count} mesi fa`,
  lastYear: "l'anno scorso",
  yearsAgo: count => `${count} anni fa`,
};
