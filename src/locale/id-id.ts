import { addLocale, type Locale } from '.';

const LOCALE: Locale = {
  code: 'id-ID',
  calendar: {
    labels: {
      weekdays: {
        full: ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'],
        abbr: ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'],
      },
      months: {
        full: [
          'Januari',
          'Februari',
          'Maret',
          'April',
          'Mei',
          'Juni',
          'Juli',
          'Agustus',
          'September',
          'Oktober',
          'November',
          'Desember',
        ],
        abbr: [
          'Jan',
          'Feb',
          'Mar',
          'Apr',
          'Mei',
          'Jun',
          'Jul',
          'Agu',
          'Sep',
          'Okt',
          'Nov',
          'Des',
        ],
      },
    },
    periods: {
      timeOfDay: {
        ranges: [
          { start: 0, end: 5, label: 'dini hari' },
          { start: 5, end: 10, label: 'pagi' },
          { start: 10, end: 15, label: 'siang' },
          { start: 15, end: 18, label: 'sore' },
          { start: 18, end: 24, label: 'malam' },
        ],
      },
    },
  },
  format: {
    patterns: {
      default: 'dddd, D MMMM YYYY [pukul] HH.mm',
      toString: 'ddd DD MMM YYYY HH.mm.ss ZZ',
    },
    relative: {
      past: '[s] yang lalu',
      future: 'dalam [s]',
      units: {
        second: { singular: 'sekarang', plural: 'beberapa detik' },
        minute: { singular: 'semenit', plural: '[n] menit' },
        hour: { singular: 'sejam', plural: '[n] jam' },
        day: { singular: 'satu hari', plural: '[n] hari' },
        week: { singular: 'satu minggu', plural: '[n] minggu' },
        month: { singular: 'satu bulan', plural: '[n] bulan' },
        year: { singular: 'satu tahun', plural: '[n] tahun' },
      },
    },
    ordinal: (n: number | string) => {
      return 'ke-' + String(n);
    },
  },
};

addLocale(LOCALE);

export default LOCALE;
