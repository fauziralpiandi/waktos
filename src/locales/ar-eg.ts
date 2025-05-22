import { type LocaleMessages } from './index';

const toArabicDigits = (num: number): string => {
  return num
    .toString()
    .replace(/[0-9]/g, d => String.fromCharCode(1632 + parseInt(d)));
};

export const AR_EG: LocaleMessages = {
  justNow: 'الآن',
  minutesAgo: count =>
    `منذ ${toArabicDigits(count)} ${count === 1 ? 'دقيقة' : 'دقائق'}`,
  hoursAgo: count =>
    `منذ ${toArabicDigits(count)} ${count === 1 ? 'ساعة' : 'ساعات'}`,
  yesterday: 'الأمس',
  daysAgo: count =>
    `منذ ${toArabicDigits(count)} ${count === 1 ? 'يوم' : 'أيام'}`,
  lastWeek: 'الأسبوع الماضي',
  weeksAgo: count =>
    `منذ ${toArabicDigits(count)} ${count === 1 ? 'أسبوع' : 'أسابيع'}`,
  lastMonth: 'الشهر الماضي',
  monthsAgo: count =>
    `منذ ${toArabicDigits(count)} ${count === 1 ? 'شهر' : 'أشهر'}`,
  lastYear: 'العام الماضي',
  yearsAgo: count =>
    `منذ ${toArabicDigits(count)} ${count === 1 ? 'سنة' : 'سنوات'}`,
};
