import { type LocaleMessages } from './index';

export const HI_IN: LocaleMessages = {
  justNow: 'अभी-अभी',
  minutesAgo: count => `${count} मिनट पहले`,
  hoursAgo: count => `${count} घंटे पहले`,
  yesterday: 'कल',
  daysAgo: count => `${count} दिन पहले`,
  lastWeek: 'पिछले सप्ताह',
  weeksAgo: count => `${count} सप्ताह पहले`,
  lastMonth: 'पिछले महीने',
  monthsAgo: count => `${count} महीने पहले`,
  lastYear: 'पिछले साल',
  yearsAgo: count => `${count} साल पहले`,
};
