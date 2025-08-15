import { type Locale, addLocale } from '.';

const LOCALE: Locale = {
  code: 'pt-BR',
  calendar: {
    labels: {
      weekdays: {
        full: [
          'domingo',
          'segunda-feira',
          'terça-feira',
          'quarta-feira',
          'quinta-feira',
          'sexta-feira',
          'sábado',
        ],
        abbr: ['dom.', 'seg.', 'ter.', 'qua.', 'qui.', 'sex.', 'sáb.'],
      },
      months: {
        full: [
          'janeiro',
          'fevereiro',
          'março',
          'abril',
          'maio',
          'junho',
          'julho',
          'agosto',
          'setembro',
          'outubro',
          'novembro',
          'dezembro',
        ],
        abbr: [
          'jan.',
          'fev.',
          'mar.',
          'abr.',
          'mai.',
          'jun.',
          'jul.',
          'ago.',
          'set.',
          'out.',
          'nov.',
          'dez.',
        ],
      },
    },
  },
  format: {
    patterns: {
      date: {
        P: 'DD/MM/YY',
        PP: 'DD [de] MMM [de] YYYY',
        PPP: 'DD [de] MMMM [de] YYYY',
        PPPP: 'dddd, DD [de] MMMM [de] YYYY',
      },
      time: {
        C: 'HH:mm',
        CC: 'HH:mm:ss',
        CCC: 'HH:mm:ss Z',
        CCCC: 'HH:mm:ss ZZ',
      },
      default: 'dddd, DD [de] MMMM [de] YYYY [às] HH:mm',
      toString: 'ddd DD [de] MMM [de] YYYY HH:mm:ss ZZ',
    },
    relative: {
      past: 'há [s]',
      future: 'em [s]',
      units: {
        second: { singular: 'agora', plural: 'alguns segundos' },
        minute: { singular: '1 minuto', plural: '[n] minutos' },
        hour: { singular: '1 hora', plural: '[n] horas' },
        day: { singular: '1 dia', plural: '[n] dias' },
        week: { singular: '1 semana', plural: '[n] semanas' },
        month: { singular: '1 mês', plural: '[n] meses' },
        year: { singular: '1 ano', plural: '[n] anos' },
      },
    },
    ordinal: (n: number | string) => {
      return String(n) + 'º';
    },
  },
};

addLocale(LOCALE);

export default LOCALE;
