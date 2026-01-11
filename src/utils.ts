type DateInput = Date | number | string | { valueOf(): number };

const leapYear = (year: number): boolean =>
  !(year & 3) && (year % 100 !== 0 || year % 400 === 0);

const parseInput = (input: DateInput): number => {
  let result: number;

  if (typeof input === 'number') {
    result = input;
  } else if (input instanceof Date) {
    result = input.getTime();
  } else if (
    input &&
    typeof input === 'object' &&
    'valueOf' in input &&
    typeof input.valueOf === 'function'
  ) {
    const value = input.valueOf();

    result = typeof value === 'number' ? value : Number.NaN;
  } else if (typeof input === 'string' && input.trim()) {
    let normalized = input.trim();

    if (/[TZ]|[+-]\d{2}:?\d{2}$/.test(normalized)) {
      result = new Date(normalized).getTime(); // already has time(zone) info
    } else {
      if (/^\d{4}-\d{2}-\d{2}\s/.test(normalized)) {
        normalized = normalized.replace(/^(\d{4}-\d{2}-\d{2})\s+/, '$1T');
      } else if (/^\d{4}-\d{2}-\d{2}$/.test(normalized)) {
        normalized += 'T00:00:00'; // date-only defaults to midnight local
      }

      result = new Date(normalized).getTime();
    }
  } else {
    result = Number.NaN;
  }

  if (!Number.isFinite(result)) {
    const value =
      typeof input === 'string' || typeof input === 'number'
        ? input
        : Object.prototype.toString.call(input); // e.g. [object Object]

    throw new Error(`Invalid date input: ${String(value)}`);
  }

  return result;
};

export type { DateInput };
export { leapYear, parseInput };
