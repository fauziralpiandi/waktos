import { type Locale, addLocale } from '.';

const LOCALE: Locale = {
  code: 'it-IT',
  calendar: {
    labels: {
      weekdays: {
        full: [
          'domenica',
          'lunedì',
          'martedì',
          'mercoledì',
          'giovedì',
          'venerdì',
          'sabato',
        ],
        abbr: ['dom', 'lun', 'mar', 'mer', 'gio', 'ven', 'sab'],
      },
      months: {
        full: [
          'gennaio',
          'febbraio',
          'marzo',
          'aprile',
          'maggio',
          'giugno',
          'luglio',
          'agosto',
          'settembre',
          'ottobre',
          'novembre',
          'dicembre',
        ],
        abbr: [
          'gen',
          'feb',
          'mar',
          'apr',
          'mag',
          'giu',
          'lug',
          'ago',
          'set',
          'ott',
          'nov',
          'dic',
        ],
      },
    },
  },
  format: {
    patterns: {
      date: {
        P: 'DD/MM/YY',
        PP: 'D MMM YYYY',
        PPP: 'D MMMM YYYY',
        PPPP: 'dddd D MMMM YYYY',
      },
      time: {
        C: 'HH:mm',
        CC: 'HH:mm:ss',
        CCC: 'HH:mm:ss Z',
        CCCC: 'HH:mm:ss ZZ',
      },
      default: 'dddd D MMMM YYYY [alle] HH:mm',
      toString: 'ddd DD MMM YYYY HH:mm:ss ZZ',
    },
    relative: {
      past: '[s] fa',
      future: 'tra [s]',
      units: {
        second: { singular: 'ora', plural: 'alcuni secondi' },
        minute: { singular: '1 minuto', plural: '[n] minuti' },
        hour: { singular: '1 ora', plural: '[n] ore' },
        day: { singular: '1 giorno', plural: '[n] giorni' },
        week: { singular: '1 settimana', plural: '[n] settimane' },
        month: { singular: '1 mese', plural: '[n] mesi' },
        year: { singular: '1 anno', plural: '[n] anni' },
      },
    },
    ordinal: (n: number | string) => {
      return String(n) + 'º';
    },
  },
};

addLocale(LOCALE);

export default LOCALE;
