import { type LocaleMessages } from './index';

export const ZH_CN: LocaleMessages = {
  justNow: '刚刚',
  minutesAgo: count => `${count}分钟前`,
  hoursAgo: count => `${count}小时前`,
  yesterday: '昨天',
  daysAgo: count => `${count}天前`,
  lastWeek: '上周',
  weeksAgo: count => `${count}周前`,
  lastMonth: '上个月',
  monthsAgo: count => `${count}个月前`,
  lastYear: '去年',
  yearsAgo: count => `${count}年前`,
};
