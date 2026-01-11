import { Cache } from './cache';
import { MILLISECOND, TIME_UNITS } from './constants';
import { getLocale, type Locale } from './locale';
import defaultLocale from './locale/en-us';
import { type DateInput, leapYear, parseInput } from './utils';

interface DateTimeComponents {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
  millisecond: number;
}

type TimeUnit = 'millisecond' | 'second' | 'minute' | 'hour';
type DateUnit = 'day' | 'month' | 'year';
type DerivedUnit = 'week';

type ComponentUnit = TimeUnit | DateUnit;
type ArithmeticUnit = TimeUnit | DateUnit | DerivedUnit;
type BoundaryUnit = Exclude<TimeUnit, 'millisecond'> | DateUnit | DerivedUnit;
type ComparisonUnit = TimeUnit | DateUnit | DerivedUnit | undefined;

interface CacheState {
  readonly timestamp: number;
  readonly locale: string;
  readonly timezone: string;
  readonly components: DateTimeComponents;
}

type CacheEntry = CacheState | null;

interface State {
  readonly _timestamp: number;
  readonly _locale: Locale;
  readonly _timezone: string;
  _cache: CacheEntry;
}

interface Internal {
  _extractComponents(): DateTimeComponents;
  _extractUtcComponents(timestamp: number): DateTimeComponents;
  _extractTimezoneComponents(
    timestamp: number,
    timezone: string,
    locale?: string,
  ): DateTimeComponents;
  _calcBoundary(
    timestamp: number,
    unit: BoundaryUnit,
    end: boolean,
    locale: Locale,
    timezone?: string,
  ): number;
  _adjustDate(
    date: Date,
    value: number,
    unit: ArithmeticUnit,
    isUtc?: boolean,
  ): void;
  _setField(value: number, field: ComponentUnit): Waktos;
}

interface Core {
  valueOf(): number;
  unix(): number;
  toDate(): Date;
  toJSON(): string;
  toString(): string;
  toISOString(): string;
  toDateString(): string;
  toTimeString(): string;
  toObject(): DateTimeComponents;
  toArray(): [number, number, number, number, number, number, number];

  shift(value: number, unit: ArithmeticUnit): Waktos; // alias of add() and sub()
  add(value: number, unit: ArithmeticUnit): Waktos;
  sub(value: number, unit: ArithmeticUnit): Waktos;

  startOf(unit: BoundaryUnit): Waktos;
  endOf(unit: BoundaryUnit): Waktos;

  year(): number;
  year(value: number): Waktos;
  month(): number;
  month(value: number): Waktos;
  day(): number;
  day(value: number): Waktos;
  hour(): number;
  hour(value: number): Waktos;
  minute(): number;
  minute(value: number): Waktos;
  second(): number;
  second(value: number): Waktos;
  millisecond(): number;
  millisecond(value: number): Waktos;

  get(unit: ComponentUnit): number;
  set(unit: ComponentUnit, value: number): Waktos;
  set(values: Partial<DateTimeComponents>): Waktos;

  format(pattern?: string): string;

  locale(code: string): Waktos;
  timezone(zone: string): Waktos;
  tz(zone: string): Waktos; // alias of timezone()

  isBefore(date: DateInput, unit?: ComparisonUnit): boolean;
  isAfter(date: DateInput, unit?: ComparisonUnit): boolean;
  isSame(date: DateInput, unit?: ComparisonUnit): boolean;
}

interface Waktos extends Core {
  readonly _pluginMarker?: boolean; // marker to distinguish from Core
}

interface Constructor {
  readonly prototype: Record<string, unknown>;
}

interface Factory {
  readonly createInstance: typeof createInstance;
}

interface Instance extends State, Internal, Core {}

type Plugin = (constructor: Constructor, waktos: Factory) => void;

const TIME_SENSITIVE_UNITS = new Set<ArithmeticUnit>(['day']);
const DATE_UNITS = new Set<ArithmeticUnit>(['month', 'year']);
const COMPONENT_UNITS = new Set<ComponentUnit>([
  'millisecond',
  'second',
  'minute',
  'hour',
  'day',
  'month',
  'year',
]);
const BOUNDARY_UNITS = new Set<BoundaryUnit>([
  'second',
  'minute',
  'hour',
  'day',
  'week',
  'month',
  'year',
]);
const INTL_FORMAT_CONFIG = Object.freeze({
  hour12: false,
  timeZone: '',
  calendar: 'gregory',
  numberingSystem: 'latn',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  fractionalSecondDigits: 3, // precision ftw
} as const);
const TOKEN_REGEX =
  /\[([^\]]+)\]|(?:YYYY|YY|MMMM|MMM|MM|M|Do|DD|D|dddd|ddd|HH|H|hh|h|mm|m|ss|s|SSS|A|a|ZZ|Z)/g;

const systemTimezone = () => {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch {
    return 'UTC';
  }
};

const resolveTimezone = systemTimezone();

const isUtcTimezone = (timezone?: string): boolean =>
  !timezone || timezone === 'UTC';

const createCacheKey = (...parts: readonly (string | number)[]): string => {
  return parts
    .map((part) => String(part).replaceAll('$', String.raw`\$`)) // escape $ char to prevent collisions
    .join('$');
};

const isCacheValid = (
  cache: CacheEntry,
  timestamp: number,
  timezone: string,
  locale: string,
): cache is CacheState =>
  cache !== null &&
  cache.timestamp === timestamp &&
  cache.timezone === timezone &&
  cache.locale === locale;

const initCacheState = (): CacheEntry => null;

const formatterCache = new Cache<string, Intl.DateTimeFormat>(50);
// approx 20 days per timezone with 15-mins chunks)
const offsetCache = new Cache<string, number>(2000);

type Formatter = (
  nums: DateTimeComponents,
  locale: Locale,
  timestamp: number,
  timezone: string,
) => string;

const compiledFormatterCache = new Cache<string, Formatter[]>(200);

const createInstance = (
  timestamp: number,
  locale = defaultLocale,
  timezone?: string,
): Waktos => {
  const instance = Object.create(core) as Instance;
  const resolvedTimezone = timezone ?? resolveTimezone;
  const result = Object.assign(instance, {
    _timestamp: timestamp,
    _locale: locale,
    _timezone: resolvedTimezone,
    _cache: initCacheState(),
  });

  return result as unknown as Waktos;
};

const createDateFormatter = (
  locale: string,
  timezone: string,
): Intl.DateTimeFormat => {
  const key = createCacheKey(locale, timezone);
  const cachedFormatter = formatterCache.get(key);

  if (cachedFormatter) return cachedFormatter;

  try {
    const instance = new Intl.DateTimeFormat(locale, {
      ...INTL_FORMAT_CONFIG,
      timeZone: timezone,
    });

    formatterCache.set(key, instance);

    return instance;
  } catch {
    try {
      const fallbackInstance = new Intl.DateTimeFormat(defaultLocale.code, {
        ...INTL_FORMAT_CONFIG,
        timeZone: timezone,
      });

      formatterCache.set(key, fallbackInstance);

      return fallbackInstance; // plan B
    } catch {
      const finalFallbackInstance = new Intl.DateTimeFormat(
        defaultLocale.code,
        {
          ...INTL_FORMAT_CONFIG,
          timeZone: resolveTimezone,
        },
      );

      formatterCache.set(key, finalFallbackInstance);

      return finalFallbackInstance;
    }
  }
};

const extractComponents = (date: Date, isUtc: boolean): DateTimeComponents => {
  return isUtc
    ? {
        year: date.getUTCFullYear(),
        month: date.getUTCMonth() + 1,
        day: date.getUTCDate(),
        hour: date.getUTCHours(),
        minute: date.getUTCMinutes(),
        second: date.getUTCSeconds(),
        millisecond: date.getUTCMilliseconds(),
      }
    : {
        year: date.getFullYear(),
        month: date.getMonth() + 1,
        day: date.getDate(),
        hour: date.getHours(),
        minute: date.getMinutes(),
        second: date.getSeconds(),
        millisecond: date.getMilliseconds(),
      };
};

const extractUtcComponents = (timestamp: number): DateTimeComponents =>
  extractComponents(new Date(timestamp), true);

const extractLocalComponents = (timestamp: number): DateTimeComponents =>
  extractComponents(new Date(timestamp), false);

const parseFormatterParts = (
  parts: readonly Intl.DateTimeFormatPart[],
): DateTimeComponents => {
  const result: DateTimeComponents = {
    year: 0,
    month: 0,
    day: 0,
    hour: 0,
    minute: 0,
    second: 0,
    millisecond: 0,
  };

  for (const { type, value } of parts) {
    const numericValue = Number.parseInt(value, 10);

    if (Number.isNaN(numericValue)) continue;

    switch (type) {
      case 'year': {
        result.year = numericValue;
        break;
      }

      case 'month': {
        result.month = numericValue;
        break;
      }

      case 'day': {
        result.day = numericValue;
        break;
      }

      case 'hour': {
        result.hour = numericValue === 24 ? 0 : numericValue; // normalize 24h to 0h for consistency
        break;
      }

      case 'minute': {
        result.minute = numericValue;
        break;
      }

      case 'second': {
        result.second = numericValue;
        break;
      }

      default: {
        if (
          type === 'fractionalSecond' ||
          type.startsWith('fractionalSecond')
        ) {
          const padded =
            value.length < 3 ? value.padEnd(3, '0') : value.slice(0, 3);
          const millisecondValue = Number.parseInt(padded, 10);

          result.millisecond = Number.isNaN(millisecondValue)
            ? 0
            : millisecondValue;
        }
        break;
      }
    }
  }

  return result;
};

const extractIntlComponents = (
  timestamp: number,
  timezone: string,
  locale: string,
): DateTimeComponents => {
  try {
    const parts = createDateFormatter(locale, timezone).formatToParts(
      new Date(timestamp),
    );
    const parsedComponents = parseFormatterParts(parts);

    parsedComponents.millisecond =
      ((timestamp % MILLISECOND.SECOND) + MILLISECOND.SECOND) %
      MILLISECOND.SECOND;

    return parsedComponents;
  } catch {
    return extractUtcComponents(timestamp);
  }
};

const parseTimezoneComponents = (
  timestamp: number,
  timezone: string,
  locale: string,
): DateTimeComponents => {
  if (isUtcTimezone(timezone)) return extractUtcComponents(timestamp);
  if (timezone === resolveTimezone) return extractLocalComponents(timestamp);

  const chunkId = Math.floor(timestamp / (15 * MILLISECOND.MINUTE));
  const cacheKey = `${timezone}$${String(chunkId)}`;
  const cachedOffset = offsetCache.get(cacheKey);

  if (cachedOffset !== undefined) {
    return extractUtcComponents(timestamp + cachedOffset);
  }

  // cache miss: calculate offset using Intl path
  const components = extractIntlComponents(timestamp, timezone, locale);
  // calculate offset
  const utcRepresentation = Date.UTC(
    components.year,
    components.month - 1,
    components.day,
    components.hour,
    components.minute,
    components.second,
    components.millisecond,
  );

  // calculate offset by comparing the "wall time" (constructed as UTC) with the actual timestamp.
  // we preserve millisecond precision to ensure accuracy, avoiding rounding issues.
  const offset = utcRepresentation - timestamp;

  offsetCache.set(cacheKey, offset);

  return components;
};

const calcTimezoneOffset = (
  timestamp: number,
  timezone: string,
  locale = defaultLocale.code,
): number => {
  if (isUtcTimezone(timezone)) return 0;
  if (timezone === resolveTimezone)
    return -new Date(timestamp).getTimezoneOffset(); // fast path for local time

  try {
    const { year, month, day, hour, minute, second, millisecond } =
      parseTimezoneComponents(timestamp, timezone, locale);
    const utcTime = Date.UTC(
      year,
      month - 1,
      day,
      hour,
      minute,
      second,
      millisecond,
    );
    const truncatedTimestamp =
      Math.trunc(timestamp / MILLISECOND.SECOND) * MILLISECOND.SECOND;
    const offsetMs = utcTime - truncatedTimestamp;
    const offsetMinutes = offsetMs / MILLISECOND.MINUTE;

    // some timezones have 15-mins offsets (e.g. Nepal, Chatham)
    return Math.round(offsetMinutes * 4) / 4;
  } catch {
    return 0;
  }
};

const correctTimezoneOffset = (
  local: number,
  offsetEstimate: number,
  timezone: string,
): [number, number] => {
  if (isUtcTimezone(timezone)) return [local, 0];

  try {
    let estimatedUtc = local - offsetEstimate * MILLISECOND.MINUTE;

    const initialOffset = calcTimezoneOffset(
      estimatedUtc,
      timezone,
      defaultLocale.code,
    );

    // DST transitions can be tricky, exact match saves computation
    if (offsetEstimate === initialOffset) return [estimatedUtc, offsetEstimate];

    // DST can shift by 1 hour, so we refine the calculation
    estimatedUtc -= (initialOffset - offsetEstimate) * MILLISECOND.MINUTE;

    const refinedOffset = calcTimezoneOffset(
      estimatedUtc,
      timezone,
      defaultLocale.code,
    );
    // pick the smaller offset to avoid double-counting DST
    const finalOffset =
      initialOffset === refinedOffset
        ? initialOffset
        : Math.min(initialOffset, refinedOffset);

    return [local - finalOffset * MILLISECOND.MINUTE, finalOffset];
  } catch {
    return [local, offsetEstimate];
  }
};

const convertToUtc = (
  values: readonly number[],
  timezone: string,
  contextTimestamp: number,
): number => {
  const [year, month, day, hour, minute, second, millisecond] = values;
  const baseUtcTime = Date.UTC(
    year,
    month - 1,
    day,
    hour,
    minute,
    second,
    millisecond,
  );

  if (isUtcTimezone(timezone)) return baseUtcTime;

  try {
    const [correctedUtcTime] = correctTimezoneOffset(
      baseUtcTime,
      calcTimezoneOffset(contextTimestamp, timezone, defaultLocale.code),
      timezone,
    );

    return correctedUtcTime;
  } catch {
    return baseUtcTime;
  }
};

const calcDayOfWeek = (year: number, month: number, day: number): number =>
  new Date(year, month - 1, day).getDay();

const calcWeekBoundary = (
  timestamp: number,
  locale: Locale,
  timezone: string,
  isEnd: boolean,
): number => {
  const { year, month, day } = parseTimezoneComponents(
    timestamp,
    timezone,
    locale.code,
  );
  const currentDayOfWeek = calcDayOfWeek(year, month, day);
  const weekStart = locale.calendar.weekStart ?? 1; // monday (ISO 8601 standard)
  const daysFromWeekStart = (currentDayOfWeek - weekStart + 7) % 7; // prevents negative modulo
  const offsetDays = isEnd ? 6 - daysFromWeekStart : -daysFromWeekStart;
  const baseDate = new Date(year, month - 1, day);

  baseDate.setDate(baseDate.getDate() + offsetDays);
  baseDate.setHours(isEnd ? 23 : 0);
  baseDate.setMinutes(isEnd ? 59 : 0);
  baseDate.setSeconds(isEnd ? 59 : 0);
  baseDate.setMilliseconds(isEnd ? 999 : 0);

  const boundaryComponents = [
    baseDate.getFullYear(),
    baseDate.getMonth() + 1,
    baseDate.getDate(),
    baseDate.getHours(),
    baseDate.getMinutes(),
    baseDate.getSeconds(),
    baseDate.getMilliseconds(),
  ];

  return convertToUtc(boundaryComponents, timezone, timestamp);
};

const setDateField = (
  date: Date,
  field: string,
  value: number,
  isUtc: boolean,
): void => {
  switch (field) {
    case 'year': {
      if (isUtc) date.setUTCFullYear(value);
      else date.setFullYear(value);
      break;
    }

    case 'month': {
      if (isUtc) date.setUTCMonth(value - 1);
      else date.setMonth(value - 1);
      break;
    }

    case 'day': {
      if (isUtc) date.setUTCDate(value);
      else date.setDate(value);
      break;
    }

    case 'hour': {
      if (isUtc) date.setUTCHours(value);
      else date.setHours(value);
      break;
    }

    case 'minute': {
      if (isUtc) date.setUTCMinutes(value);
      else date.setMinutes(value);
      break;
    }

    case 'second': {
      if (isUtc) date.setUTCSeconds(value);
      else date.setSeconds(value);
      break;
    }

    case 'millisecond': {
      if (isUtc) date.setUTCMilliseconds(value);
      else date.setMilliseconds(value);
      break;
    }
  }
};

const adjustDateComponent = (
  date: Date,
  value: number,
  unit: ArithmeticUnit,
  isUtc = false,
): void => {
  const components = extractComponents(date, isUtc);

  if (unit === 'year') {
    const newYear = components.year + value;

    if (components.month === 2 && components.day === 29 && !leapYear(newYear))
      setDateField(date, 'day', 28, isUtc); // february 29th in non-leap year

    setDateField(date, 'year', newYear, isUtc);

    return;
  }

  if (unit === 'month') {
    const targetMonth = components.month + value;

    setDateField(date, 'day', 1, isUtc);
    setDateField(date, 'month', targetMonth, isUtc);

    const { year, month } = extractComponents(date, isUtc);
    const lastDayOfMonth = calcLastDayOfMonth(year, month, isUtc);
    const validatedDay = Math.min(components.day, lastDayOfMonth); // no day 31 in february

    setDateField(date, 'day', validatedDay, isUtc);

    return;
  }

  const amount = value * TIME_UNITS[unit];
  const newTimestamp = date.getTime() + amount;

  date.setTime(newTimestamp);
};

const calcLastDayOfMonth = (
  year: number,
  month: number,
  isUtc = false,
): number =>
  isUtc
    ? new Date(Date.UTC(year, month, 0)).getUTCDate() // day 0 = last day of previous month
    : new Date(year, month, 0).getDate(); // elegant JS trick, works universally

const calcBoundaryTimestamp = (
  timestamp: number,
  unit: BoundaryUnit,
  end: boolean,
  locale: Locale,
  timezone?: string,
): number => {
  const resolvedTimezone = timezone ?? resolveTimezone;

  if (unit === 'week') {
    try {
      return calcWeekBoundary(timestamp, locale, resolvedTimezone, end);
    } catch {
      return timestamp;
    }
  }

  const { year, month, day, hour, minute, second, millisecond } =
    parseTimezoneComponents(timestamp, resolvedTimezone, locale.code);
  const components = [year, month, day, hour, minute, second, millisecond];

  switch (unit) {
    case 'second': {
      components[6] = end ? 999 : 0;
      break;
    }

    case 'minute': {
      components[5] = end ? 59 : 0;
      components[6] = end ? 999 : 0;
      break;
    }

    case 'hour': {
      components[4] = end ? 59 : 0;
      components[5] = end ? 59 : 0;
      components[6] = end ? 999 : 0;
      break;
    }

    case 'day': {
      components[3] = end ? 23 : 0;
      components[4] = end ? 59 : 0;
      components[5] = end ? 59 : 0;
      components[6] = end ? 999 : 0;
      break;
    }

    case 'month': {
      components[2] = end ? calcLastDayOfMonth(year, month) : 1;
      components[3] = end ? 23 : 0;
      components[4] = end ? 59 : 0;
      components[5] = end ? 59 : 0;
      components[6] = end ? 999 : 0;
      break;
    }

    case 'year': {
      components[1] = end ? 12 : 1;
      components[2] = end ? calcLastDayOfMonth(year, 12) : 1;
      components[3] = end ? 23 : 0;
      components[4] = end ? 59 : 0;
      components[5] = end ? 59 : 0;
      components[6] = end ? 999 : 0;
      break;
    }

    default: {
      return timestamp;
    }
  }

  try {
    return convertToUtc(components, resolvedTimezone, timestamp);
  } catch {
    return timestamp;
  }
};

const setFieldWithTimezone = (
  inst: Instance,
  value: number,
  field: ComponentUnit,
): Waktos => {
  const isUtc = isUtcTimezone(inst._timezone);

  if (isUtc) {
    const date = new Date(inst._timestamp);

    if (field === 'month') {
      const currentDay = date.getUTCDate();
      const currentYear = date.getUTCFullYear();
      const lastDayOfTargetMonth = calcLastDayOfMonth(currentYear, value, true);

      if (currentDay > lastDayOfTargetMonth) {
        date.setUTCDate(lastDayOfTargetMonth);
      }
    }

    setDateField(date, field, value, true);

    return createInstance(date.getTime(), inst._locale, inst._timezone);
  }

  const parts = createDateFormatter(
    inst._locale.code,
    inst._timezone,
  ).formatToParts(new Date(inst._timestamp));
  const parsedComponents = parseFormatterParts(parts);
  const values = [
    field === 'year' ? value : parsedComponents.year,
    field === 'month' ? value : parsedComponents.month,
    field === 'day' ? value : parsedComponents.day,
    field === 'hour' ? value : parsedComponents.hour,
    field === 'minute' ? value : parsedComponents.minute,
    field === 'second' ? value : parsedComponents.second,
    field === 'millisecond' ? value : parsedComponents.millisecond,
  ];

  if (field === 'month' || field === 'day') {
    const targetYear = values[0];
    const targetMonth = values[1];
    const targetDay = values[2];
    const lastDayOfMonth = calcLastDayOfMonth(targetYear, targetMonth);

    if (targetDay > lastDayOfMonth) {
      values[2] = lastDayOfMonth;
    }
  }

  return createInstance(
    convertToUtc(values, inst._timezone, inst._timestamp),
    inst._locale,
    inst._timezone,
  );
};

const formatTimezoneOffset = (offset: number, z = false): string => {
  if (offset === 0) return z ? 'GMT' : 'Z';

  const sign = offset > 0 ? '+' : '-';
  const absOffset = Math.abs(offset);
  const hours = Math.floor(absOffset / 60)
    .toString()
    .padStart(2, '0');
  const minutes = (absOffset % 60).toString().padStart(2, '0');

  return z
    ? `GMT${sign}${hours}:${minutes}` // human-readable
    : `${sign}${hours}:${minutes}`; // machine-readable
};

const formatNumber = (n: number, pad = 0): string =>
  String(n).padStart(pad, '0');

const compilePattern = (pattern: string, locale: Locale): Formatter[] => {
  const parts: Formatter[] = [];

  let lastIndex = 0;
  let match;

  TOKEN_REGEX.lastIndex = 0;

  while ((match = TOKEN_REGEX.exec(pattern)) !== null) {
    if (match.index > lastIndex) {
      const staticText = pattern.slice(lastIndex, match.index);

      parts.push(() => staticText);
    }

    const token = match[0];
    const literal = match[1];

    if (literal) {
      parts.push(() => literal);
    } else {
      switch (token) {
        case 'YYYY': {
          parts.push((nums) => formatNumber(nums.year, 4));
          break;
        }
        case 'YY': {
          parts.push((nums) => String(nums.year).slice(-2));
          break;
        }
        case 'MMMM': {
          parts.push(
            (nums) => locale.calendar.labels.months.full[nums.month - 1] ?? '',
          );
          break;
        }
        case 'MMM': {
          parts.push(
            (nums) => locale.calendar.labels.months.abbr[nums.month - 1] ?? '',
          );
          break;
        }
        case 'MM': {
          parts.push((nums) => formatNumber(nums.month, 2));
          break;
        }
        case 'M': {
          parts.push((nums) => formatNumber(nums.month));
          break;
        }
        case 'Do': {
          parts.push(
            (nums) =>
              locale.format.ordinal?.(formatNumber(nums.day)) ??
              formatNumber(nums.day),
          );
          break;
        }
        case 'DD': {
          parts.push((nums) => formatNumber(nums.day, 2));
          break;
        }
        case 'D': {
          parts.push((nums) => formatNumber(nums.day));
          break;
        }
        case 'dddd': {
          parts.push(
            (nums) =>
              locale.calendar.labels.weekdays.full[
                calcDayOfWeek(nums.year, nums.month, nums.day)
              ] ?? '',
          );
          break;
        }
        case 'ddd': {
          parts.push(
            (nums) =>
              locale.calendar.labels.weekdays.abbr[
                calcDayOfWeek(nums.year, nums.month, nums.day)
              ] ?? '',
          );
          break;
        }
        case 'HH': {
          parts.push((nums) => formatNumber(nums.hour, 2));
          break;
        }
        case 'H': {
          parts.push((nums) => formatNumber(nums.hour));
          break;
        }
        case 'hh': {
          parts.push((nums) => {
            const h = nums.hour % 12 || 12;

            return formatNumber(h, 2);
          });
          break;
        }
        case 'h': {
          parts.push((nums) => formatNumber(nums.hour % 12 || 12));
          break;
        }
        case 'mm': {
          parts.push((nums) => formatNumber(nums.minute, 2));
          break;
        }
        case 'm': {
          parts.push((nums) => formatNumber(nums.minute));
          break;
        }
        case 'ss': {
          parts.push((nums) => formatNumber(nums.second, 2));
          break;
        }
        case 's': {
          parts.push((nums) => formatNumber(nums.second));
          break;
        }
        case 'SSS': {
          parts.push((nums) => formatNumber(nums.millisecond, 3));
          break;
        }
        case 'A': {
          parts.push((nums) => (nums.hour >= 12 ? 'PM' : 'AM'));
          break;
        }
        case 'a': {
          parts.push((nums) => (nums.hour >= 12 ? 'pm' : 'am'));
          break;
        }
        case 'ZZ':
        case 'Z': {
          const isZZ = token === 'ZZ';

          parts.push((_nums, _locale, ts, tz) => {
            const offset = calcTimezoneOffset(ts, tz, _locale.code);

            return formatTimezoneOffset(offset, isZZ);
          });
          break;
        }
        default: {
          parts.push(() => token);
        }
      }
    }

    lastIndex = TOKEN_REGEX.lastIndex;
  }

  if (lastIndex < pattern.length) {
    const tail = pattern.slice(lastIndex);

    parts.push(() => tail);
  }

  return parts;
};

const formatByPattern = (
  timestamp: number,
  locale: Locale,
  timezone?: string,
  pattern?: string,
): string => {
  const finalPattern = pattern ?? locale.format.patterns.default;
  const cacheKey = createCacheKey(locale.code, finalPattern);

  let formatters = compiledFormatterCache.get(cacheKey);

  if (!formatters) {
    formatters = compilePattern(finalPattern, locale);
    compiledFormatterCache.set(cacheKey, formatters);
  }

  const resolvedTimezone = timezone ?? resolveTimezone;
  const isUtc = isUtcTimezone(resolvedTimezone);
  const nums = isUtc
    ? extractUtcComponents(timestamp)
    : parseTimezoneComponents(timestamp, resolvedTimezone, locale.code);

  let result = ''; // fast path execution

  for (const formatter of formatters) {
    result += formatter(nums, locale, timestamp, resolvedTimezone);
  }

  const finalResult = locale.format.numeral
    ? locale.format.numeral(result)
    : result;

  return locale.rtl ? `\u202B${finalResult}\u202C` : finalResult;
};

const core = {
  _timestamp: 0,
  _locale: defaultLocale,
  _timezone: resolveTimezone,
  _cache: initCacheState(),
  _extractComponents(): DateTimeComponents {
    if (
      isCacheValid(
        this._cache,
        this._timestamp,
        this._timezone,
        this._locale.code,
      )
    ) {
      return this._cache.components;
    }

    const isUtc = isUtcTimezone(this._timezone);
    const components = isUtc
      ? this._extractUtcComponents(this._timestamp)
      : this._extractTimezoneComponents(
          this._timestamp,
          this._timezone,
          this._locale.code,
        );

    this._cache = {
      timestamp: this._timestamp,
      timezone: this._timezone,
      locale: this._locale.code,
      components,
    };

    return components;
  },

  _extractUtcComponents(timestamp: number): DateTimeComponents {
    return extractUtcComponents(timestamp);
  },

  _extractTimezoneComponents(
    timestamp: number,
    timezone: string,
    locale?: string,
  ): DateTimeComponents {
    return parseTimezoneComponents(
      timestamp,
      timezone,
      locale ?? this._locale.code,
    );
  },

  _calcBoundary(
    timestamp: number,
    unit: BoundaryUnit,
    end: boolean,
    locale: Locale,
    timezone?: string,
  ): number {
    return calcBoundaryTimestamp(timestamp, unit, end, locale, timezone);
  },

  _adjustDate(
    date: Date,
    value: number,
    unit: ArithmeticUnit,
    isUtc = false,
  ): void {
    adjustDateComponent(date, value, unit, isUtc);
  },

  _setField(value: number, field: ComponentUnit): Waktos {
    return setFieldWithTimezone(this as Instance, value, field);
  },

  valueOf(): number {
    return this._timestamp;
  },

  shift(value: number, unit: ArithmeticUnit): Waktos {
    const multiplier = TIME_UNITS[unit];
    const isUtc = isUtcTimezone(this._timezone);

    if (multiplier > 0 && (isUtc || !TIME_SENSITIVE_UNITS.has(unit))) {
      return createInstance(
        this._timestamp + value * multiplier,
        this._locale,
        this._timezone,
      );
    }

    if (isUtc && multiplier === 0) {
      const date = new Date(this._timestamp);

      if (DATE_UNITS.has(unit)) this._adjustDate(date, value, unit, true);

      return createInstance(date.getTime(), this._locale, this._timezone);
    }

    const { year, month, day, hour, minute, second, millisecond } =
      this._extractTimezoneComponents(
        this._timestamp,
        this._timezone,
        this._locale.code,
      );
    const local = new Date(
      year,
      month - 1,
      day,
      hour,
      minute,
      second,
      millisecond,
    );

    switch (unit) {
      case 'hour': {
        local.setHours(hour + value);
        break;
      }

      case 'day': {
        local.setDate(day + value);
        break;
      }

      case 'month': {
        this._adjustDate(local, value, 'month', false);
        break;
      }

      case 'year': {
        this._adjustDate(local, value, 'year', false);
        break;
      }
    }

    const localComponents = [
      local.getFullYear(),
      local.getMonth() + 1,
      local.getDate(),
      local.getHours(),
      local.getMinutes(),
      local.getSeconds(),
      local.getMilliseconds(),
    ] as const;

    return createInstance(
      convertToUtc(localComponents, this._timezone, this._timestamp),
      this._locale,
      this._timezone,
    );
  },

  add(value: number, unit: ArithmeticUnit): Waktos {
    return this.shift(value, unit);
  },

  sub(value: number, unit: ArithmeticUnit): Waktos {
    return this.shift(-value, unit);
  },

  startOf(unit: BoundaryUnit): Waktos {
    return createInstance(
      this._calcBoundary(
        this._timestamp,
        unit,
        false,
        this._locale,
        this._timezone,
      ),
      this._locale,
      this._timezone,
    );
  },

  endOf(unit: BoundaryUnit): Waktos {
    return createInstance(
      this._calcBoundary(
        this._timestamp,
        unit,
        true,
        this._locale,
        this._timezone,
      ),
      this._locale,
      this._timezone,
    );
  },

  unix(): number {
    return Math.floor(this._timestamp / MILLISECOND.SECOND);
  },

  toDate(): Date {
    return new Date(this._timestamp);
  },

  toJSON(): string {
    return new Date(this._timestamp).toISOString();
  },

  toString(): string {
    return this.format(this._locale.format.patterns.toString);
  },

  toISOString(): string {
    return new Date(this._timestamp).toISOString();
  },

  toDateString(): string {
    return this.format('ddd MMM DD YYYY');
  },

  toTimeString(): string {
    return this.format('HH:mm:ss ZZ');
  },

  toObject(): DateTimeComponents {
    return this._extractComponents();
  },

  toArray(): [number, number, number, number, number, number, number] {
    return Object.values(this._extractComponents()) as [
      number,
      number,
      number,
      number,
      number,
      number,
      number,
    ];
  },

  format(pattern?: string): string {
    return formatByPattern(
      this._timestamp,
      this._locale,
      this._timezone,
      pattern,
    );
  },

  locale(code: string): Waktos {
    const resolvedLocale = getLocale(code) ?? defaultLocale;

    return createInstance(this._timestamp, resolvedLocale, this._timezone);
  },

  timezone(zone: string): Waktos {
    return createInstance(this._timestamp, this._locale, zone);
  },

  tz(zone: string): Waktos {
    return this.timezone(zone);
  },

  year(value?: number) {
    if (value === undefined) return this._extractComponents().year;

    return this._setField(value, 'year');
  },

  month(value?: number) {
    if (value === undefined) return this._extractComponents().month;

    return this._setField(value, 'month');
  },

  day(value?: number) {
    if (value === undefined) return this._extractComponents().day;

    return this._setField(value, 'day');
  },

  hour(value?: number) {
    if (value === undefined) return this._extractComponents().hour;

    return this._setField(value, 'hour');
  },

  minute(value?: number) {
    if (value === undefined) return this._extractComponents().minute;

    return this._setField(value, 'minute');
  },

  second(value?: number) {
    if (value === undefined) return this._extractComponents().second;

    return this._setField(value, 'second');
  },

  millisecond(value?: number) {
    if (value === undefined) return this._extractComponents().millisecond;

    return this._setField(value, 'millisecond');
  },

  get(unit: ComponentUnit): number {
    const components = this._extractComponents();

    return components[unit as keyof DateTimeComponents];
  },

  set(
    unitOrValues: ComponentUnit | Partial<DateTimeComponents>,
    value?: number,
  ): Waktos {
    if (typeof unitOrValues === 'string' && value !== undefined)
      return this._setField(value, unitOrValues);
    if (typeof unitOrValues === 'object') {
      let result = createInstance(
        this._timestamp,
        this._locale,
        this._timezone,
      );

      for (const [key, val] of Object.entries(unitOrValues)) {
        if (
          typeof val === 'number' &&
          COMPONENT_UNITS.has(key as ComponentUnit)
        ) {
          result = result.set(key as ComponentUnit, val);
        }
      }

      return result;
    }

    return createInstance(this._timestamp, this._locale, this._timezone);
  },

  isBefore(date: DateInput, unit?: ComparisonUnit): boolean {
    const compareTimestamp = parseInput(date);

    if (!unit) return this._timestamp < compareTimestamp;
    if (BOUNDARY_UNITS.has(unit as BoundaryUnit)) {
      const thisStart = this.startOf(unit as BoundaryUnit);
      const otherStart = createInstance(
        compareTimestamp,
        this._locale,
        this._timezone,
      ).startOf(unit as BoundaryUnit);

      return thisStart.valueOf() < otherStart.valueOf();
    }

    const truncatedThis =
      Math.trunc(this._timestamp / TIME_UNITS[unit]) * TIME_UNITS[unit];
    const truncatedOther =
      Math.trunc(compareTimestamp / TIME_UNITS[unit]) * TIME_UNITS[unit];

    return truncatedThis < truncatedOther;
  },

  isAfter(date: DateInput, unit?: ComparisonUnit): boolean {
    const compareTimestamp = parseInput(date);

    if (!unit) return this._timestamp > compareTimestamp;
    if (BOUNDARY_UNITS.has(unit as BoundaryUnit)) {
      const thisStart = this.startOf(unit as BoundaryUnit);
      const otherStart = createInstance(
        compareTimestamp,
        this._locale,
        this._timezone,
      ).startOf(unit as BoundaryUnit);

      return thisStart.valueOf() > otherStart.valueOf();
    }

    const truncatedThis =
      Math.trunc(this._timestamp / TIME_UNITS[unit]) * TIME_UNITS[unit];
    const truncatedOther =
      Math.trunc(compareTimestamp / TIME_UNITS[unit]) * TIME_UNITS[unit];

    return truncatedThis > truncatedOther;
  },

  isSame(date: DateInput, unit?: ComparisonUnit): boolean {
    const compareTimestamp = parseInput(date);

    if (!unit) return this._timestamp === compareTimestamp;
    if (BOUNDARY_UNITS.has(unit as BoundaryUnit)) {
      const thisStart = this.startOf(unit as BoundaryUnit);
      const otherStart = createInstance(
        compareTimestamp,
        this._locale,
        this._timezone,
      ).startOf(unit as BoundaryUnit);

      return thisStart.valueOf() === otherStart.valueOf();
    }

    const truncatedThis =
      Math.trunc(this._timestamp / TIME_UNITS[unit]) * TIME_UNITS[unit];
    const truncatedOther =
      Math.trunc(compareTimestamp / TIME_UNITS[unit]) * TIME_UNITS[unit];

    return truncatedThis === truncatedOther;
  },

  [Symbol.toPrimitive](hint: string): number | string {
    if (hint === 'number') return this._timestamp;
    if (hint === 'string') return this.toString();

    return this._timestamp;
  },
};

function waktos(date?: DateInput): Waktos {
  if (date === undefined)
    return createInstance(Date.now(), defaultLocale, undefined);

  const timestamp = parseInput(date);

  return createInstance(timestamp, defaultLocale, undefined);
}

waktos.isValid = (input: unknown): boolean => {
  try {
    if (input === undefined || input === null) return false;

    parseInput(input as DateInput);

    return true;
  } catch {
    return false;
  }
};

waktos.unix = (timestamp: number): Waktos => {
  return createInstance(
    timestamp * MILLISECOND.SECOND,
    defaultLocale,
    undefined,
  );
};

waktos.utc = (date?: DateInput): Waktos => {
  let timestamp: number;

  if (typeof date === 'string' && !/[Z]|[+-]\d{2}(?::?\d{2})?$/.test(date)) {
    timestamp = parseInput(`${date}Z`);
  } else {
    timestamp = date === undefined ? Date.now() : parseInput(date);
  }

  return createInstance(timestamp, defaultLocale, 'UTC');
};

waktos.plugin = (...plugins: Plugin[]): typeof waktos => {
  for (const plugin of plugins) {
    plugin({ prototype: core }, { ...waktos, createInstance });
  }

  return waktos;
};

export default waktos;
export type {
  ArithmeticUnit,
  BoundaryUnit,
  ComparisonUnit,
  ComponentUnit,
  Constructor,
  DateTimeComponents,
  Factory,
  Plugin,
  Waktos,
};

export { type Locale } from './locale';
export { type DateInput } from './utils';
