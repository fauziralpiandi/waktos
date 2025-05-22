import { type LocaleMessages } from './index';

export const FR_CD: LocaleMessages = {
  justNow: "à l'instant",
  minutesAgo: count => `il y a ${count} ${count === 1 ? 'minute' : 'minutes'}`,
  hoursAgo: count => `il y a ${count} ${count === 1 ? 'heure' : 'heures'}`,
  yesterday: 'hier',
  daysAgo: count => `il y a ${count} jours`,
  lastWeek: 'la semaine dernière',
  weeksAgo: count => `il y a ${count} semaines`,
  lastMonth: 'le mois dernier',
  monthsAgo: count => `il y a ${count} mois`,
  lastYear: "l'année dernière",
  yearsAgo: count => `il y a ${count} ans`,
};
