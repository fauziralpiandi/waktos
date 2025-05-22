import { type LocaleMessages } from './index';

export const SW_KE: LocaleMessages = {
  justNow: 'sasa hivi',
  minutesAgo: count =>
    `dakika ${count} ${count === 1 ? 'iliyopita' : 'zilizopita'}`,
  hoursAgo: count => `saa ${count} ${count === 1 ? 'iliyopita' : 'zilizopita'}`,
  yesterday: 'jana',
  daysAgo: count => `siku ${count} zilizopita`,
  lastWeek: 'wiki iliyopita',
  weeksAgo: count => `wiki ${count} zilizopita`,
  lastMonth: 'mwezi uliopita',
  monthsAgo: count => `miezi ${count} iliyopita`,
  lastYear: 'mwaka uliopita',
  yearsAgo: count => `miaka ${count} iliyopita`,
};
