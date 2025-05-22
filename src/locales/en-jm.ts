import { type LocaleMessages } from './index';

export const EN_JM: LocaleMessages = {
  justNow: 'just now',
  minutesAgo: count => `${count} ${count === 1 ? 'minute' : 'minutes'} ago`,
  hoursAgo: count => `${count} ${count === 1 ? 'hour' : 'hours'} ago`,
  yesterday: 'yesterday',
  daysAgo: count => `${count} days ago`,
  lastWeek: 'last week',
  weeksAgo: count => `${count} weeks ago`,
  lastMonth: 'last month',
  monthsAgo: count => `${count} months ago`,
  lastYear: 'last year',
  yearsAgo: count => `${count} years ago`,
};
