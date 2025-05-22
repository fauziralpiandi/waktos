import { type LocaleMessages } from './index';

export const ES_GT: LocaleMessages = {
  justNow: 'justo ahora',
  minutesAgo: count => `hace ${count} ${count === 1 ? 'minuto' : 'minutos'}`,
  hoursAgo: count => `hace ${count} ${count === 1 ? 'hora' : 'horas'}`,
  yesterday: 'ayer',
  daysAgo: count => `hace ${count} días`,
  lastWeek: 'la semana pasada',
  weeksAgo: count => `hace ${count} semanas`,
  lastMonth: 'el mes pasado',
  monthsAgo: count => `hace ${count} meses`,
  lastYear: 'el año pasado',
  yearsAgo: count => `hace ${count} años`,
};
