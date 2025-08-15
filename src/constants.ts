const MILLISECOND = Object.freeze({
  SECOND: 1_000,
  MINUTE: 60_000,
  HOUR: 3_600_000,
  DAY: 86_400_000,
  WEEK: 604_800_000,
  MONTH: 30.436875 * 86_400_000, // avg. gregorian month length
  YEAR: 365.2425 * 86_400_000, // accounts for leap year cycle
});

const TIME_UNITS = Object.freeze({
  millisecond: 1,
  second: MILLISECOND.SECOND,
  minute: MILLISECOND.MINUTE,
  hour: MILLISECOND.HOUR,
  day: MILLISECOND.DAY,
  week: MILLISECOND.WEEK,
  month: 0, // special treatment
  year: 0, // special treatment
}) satisfies Record<string, number>;

export { MILLISECOND, TIME_UNITS };
