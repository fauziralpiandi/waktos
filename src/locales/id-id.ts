import { type LocaleMessages } from './index';

export const ID_ID: LocaleMessages = {
  justNow: 'baru saja',
  minutesAgo: count => `${count} menit yang lalu`,
  hoursAgo: count => `${count} jam yang lalu`,
  yesterday: 'kemarin',
  daysAgo: count => `${count} hari yang lalu`,
  lastWeek: 'minggu lalu',
  weeksAgo: count => `${count} minggu yang lalu`,
  lastMonth: 'bulan lalu',
  monthsAgo: count => `${count} bulan yang lalu`,
  lastYear: 'tahun lalu',
  yearsAgo: count => `${count} tahun yang lalu`,
};
