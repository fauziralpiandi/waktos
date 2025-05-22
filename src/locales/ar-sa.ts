import { type LocaleMessages } from './index';

const toArabicDigits = (num: number): string => {
  return num
    .toString()
    .replace(/[0-9]/g, d => String.fromCharCode(1632 + parseInt(d)));
};

export const AR_SA: LocaleMessages = {
  justNow: 'الآن',
  minutesAgo: count =>
    `قبل ${toArabicDigits(count)} ${count === 1 ? 'دقيقة' : 'دقائق'}`,
  hoursAgo: count =>
    `قبل ${toArabicDigits(count)} ${count === 1 ? 'ساعة' : 'ساعات'}`,
  yesterday: 'الأمس',
  daysAgo: count =>
    `قبل ${toArabicDigits(count)} ${count === 1 ? 'يوم' : 'أيام'}`,
  lastWeek: 'الأسبوع الماضي',
  weeksAgo: count =>
    `قبل ${toArabicDigits(count)} ${count === 1 ? 'أسبوع' : 'أسابيع'}`,
  lastMonth: 'الشهر الماضي',
  monthsAgo: count =>
    `قبل ${toArabicDigits(count)} ${count === 1 ? 'شهر' : 'أشهر'}`,
  lastYear: 'السنة الماضية',
  yearsAgo: count =>
    `قبل ${toArabicDigits(count)} ${count === 1 ? 'سنة' : 'سنوات'}`,
};
