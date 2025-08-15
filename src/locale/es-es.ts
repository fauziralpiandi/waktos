import { type Locale, addLocale } from '.';

const LOCALE: Locale = {
  code: 'es-ES',
  calendar: {
    labels: {
      weekdays: {
        full: [
          'domingo',
          'lunes',
          'martes',
          'miércoles',
          'jueves',
          'viernes',
          'sábado',
        ],
        abbr: ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb'],
      },
      months: {
        full: [
          'enero',
          'febrero',
          'marzo',
          'abril',
          'mayo',
          'junio',
          'julio',
          'agosto',
          'septiembre',
          'octubre',
          'noviembre',
          'diciembre',
        ],
        abbr: [
          'ene',
          'feb',
          'mar',
          'abr',
          'may',
          'jun',
          'jul',
          'ago',
          'sept',
          'oct',
          'nov',
          'dic',
        ],
      },
    },
  },
  format: {
    patterns: {
      date: {
        P: 'D/M/YY',
        PP: 'D MMM YYYY',
        PPP: 'D [de] MMMM [de] YYYY',
        PPPP: 'dddd, D [de] MMMM [de] YYYY',
      },
      time: {
        C: 'H:mm',
        CC: 'H:mm:ss',
        CCC: 'H:mm:ss Z',
        CCCC: 'H:mm:ss ZZ',
      },
      default: 'dddd, D [de] MMMM [de] YYYY [a las] H:mm',
      toString: 'ddd DD MMM YYYY H:mm:ss ZZ',
    },
    relative: {
      past: 'hace [s]',
      future: 'dentro de [s]',
      units: {
        second: { singular: 'ahora', plural: 'unos segundos' },
        minute: { singular: '1 minuto', plural: '[n] minutos' },
        hour: { singular: '1 hora', plural: '[n] horas' },
        day: { singular: '1 día', plural: '[n] días' },
        week: { singular: '1 semana', plural: '[n] semanas' },
        month: { singular: '1 mes', plural: '[n] meses' },
        year: { singular: '1 año', plural: '[n] años' },
      },
    },
    ordinal: (n: number | string) => {
      return String(n) + '.º';
    },
  },
};

addLocale(LOCALE);

export default LOCALE;
