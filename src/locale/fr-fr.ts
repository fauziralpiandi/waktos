import { type Locale, addLocale } from '.';

const LOCALE: Locale = {
  code: 'fr-FR',
  calendar: {
    labels: {
      weekdays: {
        full: [
          'dimanche',
          'lundi',
          'mardi',
          'mercredi',
          'jeudi',
          'vendredi',
          'samedi',
        ],
        abbr: ['dim.', 'lun.', 'mar.', 'mer.', 'jeu.', 'ven.', 'sam.'],
      },
      months: {
        full: [
          'janvier',
          'février',
          'mars',
          'avril',
          'mai',
          'juin',
          'juillet',
          'août',
          'septembre',
          'octobre',
          'novembre',
          'décembre',
        ],
        abbr: [
          'janv.',
          'févr.',
          'mars',
          'avr.',
          'mai',
          'juin',
          'juil.',
          'août',
          'sept.',
          'oct.',
          'nov.',
          'déc.',
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
      default: 'dddd D MMMM YYYY [à] HH:mm',
      toString: 'ddd DD MMM YYYY HH:mm:ss ZZ',
    },
    relative: {
      past: 'il y a [s]',
      future: 'dans [s]',
      units: {
        second: { singular: 'maintenant', plural: 'quelques secondes' },
        minute: { singular: '1 minute', plural: '[n] minutes' },
        hour: { singular: '1 heure', plural: '[n] heures' },
        day: { singular: '1 jour', plural: '[n] jours' },
        week: { singular: '1 semaine', plural: '[n] semaines' },
        month: { singular: '1 mois', plural: '[n] mois' },
        year: { singular: '1 année', plural: '[n] années' },
      },
    },
    ordinal: (n: number | string) => {
      return Number(n) === 1 ? '1er' : String(n) + 'e';
    },
  },
};

addLocale(LOCALE);

export default LOCALE;
