import { Cache } from "./cache";
import { MS_SECOND, MS_MINUTE, MS_HOUR, MS_DAY } from "./constants";
import type {
  Api,
  CanonicalUnit,
  CanonicalDuration,
  DateInput,
  DateParts,
  Disambiguation,
  Duration,
  IsoFormat,
  OrdinalFn,
  PatternFn,
  PluginCache,
  Unit
} from "./types";

function resolveSystem() {
  try {
    const { locale, timeZone } = Intl.DateTimeFormat().resolvedOptions();
    return { locale, timeZone };
  } catch {
    return {
      locale: "en-US",
      timeZone: "UTC"
    };
  }
}

const { locale: LOCALE, timeZone: ZONE } = resolveSystem();
const MAX_DATE_TIMESTAMP = 8.64e15;

const stringCache = new Cache<string, number>(384);
const utcStringCache = new Cache<string, number>(128);

const ISO_REGEX =
  /^(\d{4})-(\d{2})-(\d{2})(?:T(\d{2}):(\d{2})(?::(\d{2})(?:\.(\d{1,3}))?)?(?:([Zz])|([+-])(\d{2})(?::?(\d{2})))?)?$/;

function isTimestamp(value: number): boolean {
  return Number.isFinite(value) && Math.abs(value) <= MAX_DATE_TIMESTAMP;
}

function partsStamp(
  year: number,
  month: number,
  day: number,
  hour: number,
  minute: number,
  second: number,
  millisecond: number,
  utc: boolean
): number | undefined {
  const date = new Date(0);
  const monthIndex = month - 1;

  if (utc) {
    date.setUTCFullYear(year, monthIndex, day);
    if (
      date.getUTCFullYear() !== year ||
      date.getUTCMonth() !== monthIndex ||
      date.getUTCDate() !== day
    ) {
      return undefined;
    }
    date.setUTCHours(hour, minute, second, millisecond);
    const timestamp = date.getTime();
    return isTimestamp(timestamp) ? timestamp : undefined;
  }

  date.setFullYear(year, monthIndex, day);
  if (
    date.getFullYear() !== year ||
    date.getMonth() !== monthIndex ||
    date.getDate() !== day
  ) {
    return undefined;
  }
  date.setHours(hour, minute, second, millisecond);
  const timestamp = date.getTime();
  return isTimestamp(timestamp) ? timestamp : undefined;
}

function parseIso(raw: string, offsetlessAsUtc = false): number | undefined {
  const match = ISO_REGEX.exec(raw);
  if (!match) return undefined;

  const [
    ,
    yearText,
    monthText,
    dayText,
    hourText,
    minuteText,
    secondText,
    fractionText,
    utcMarker,
    offsetSign,
    offsetHourText,
    offsetMinuteText
  ] = match as unknown as IsoFormat;

  const year = +yearText;
  const month = +monthText;
  const day = +dayText;
  const hour = +(hourText ?? 0);
  const minute = +(minuteText ?? 0);
  const second = +(secondText ?? 0);
  const millisecond = fractionText ? +(fractionText + "00").slice(0, 3) : 0;

  if (hour > 23 || minute > 59 || second > 59) return undefined;

  const wallStamp = partsStamp(
    year,
    month,
    day,
    hour,
    minute,
    second,
    millisecond,
    true
  );
  if (wallStamp === undefined) return undefined;

  if (utcMarker !== undefined) return wallStamp;

  if (offsetSign === undefined) {
    if (offsetlessAsUtc) return wallStamp;

    return partsStamp(
      year,
      month,
      day,
      hour,
      minute,
      second,
      millisecond,
      false
    );
  }

  if (!offsetHourText || !offsetMinuteText) return undefined;

  const offsetHour = +offsetHourText;
  const offsetMinute = +offsetMinuteText;

  if (offsetHour > 23 || offsetMinute > 59) return undefined;

  const offsetMs = (offsetHour * 60 + offsetMinute) * MS_MINUTE;

  const timestamp = wallStamp + (offsetSign === "+" ? -offsetMs : offsetMs);
  return isTimestamp(timestamp) ? timestamp : undefined;
}

function parseWallString(input: unknown): DateParts {
  if (typeof input !== "string" || !input.trim()) {
    throw new TypeError("Invalid wall time.");
  }

  const match = ISO_REGEX.exec(input.trim());
  if (!match) throw new RangeError("Invalid wall time.");

  const [
    ,
    yearText,
    monthText,
    dayText,
    hourText,
    minuteText,
    secondText,
    fractionText,
    utcMarker,
    offsetSign
  ] = match as unknown as IsoFormat;

  if (utcMarker !== undefined || offsetSign !== undefined) {
    throw new RangeError("Wall time must not include an offset.");
  }

  const wall: DateParts = {
    year: +yearText,
    month: +monthText,
    day: +dayText,
    hour: +(hourText ?? 0),
    minute: +(minuteText ?? 0),
    second: +(secondText ?? 0),
    millisecond: fractionText ? +(fractionText + "00").slice(0, 3) : 0
  };

  if (
    wall.hour > 23 ||
    wall.minute > 59 ||
    wall.second > 59 ||
    partsStamp(
      wall.year,
      wall.month,
      wall.day,
      wall.hour,
      wall.minute,
      wall.second,
      wall.millisecond,
      true
    ) === undefined
  ) {
    throw new RangeError("Invalid wall time.");
  }

  return wall;
}

function parseStringSafe(
  input: string,
  cache: Cache<string, number>,
  offsetlessAsUtc: boolean
): number | undefined {
  const trimmedInput = input.trim();
  if (!trimmedInput) return undefined;

  const cachedTimestamp = cache.get(trimmedInput);
  if (cachedTimestamp !== undefined) return cachedTimestamp;

  const parsedTimestamp = parseIso(trimmedInput, offsetlessAsUtc);
  if (parsedTimestamp === undefined) return undefined;

  cache.set(trimmedInput, parsedTimestamp);
  return parsedTimestamp;
}

function parseInputSafe(
  input: unknown,
  offsetlessAsUtc = false
): number | undefined {
  if (typeof input === "string") {
    return parseStringSafe(
      input,
      offsetlessAsUtc ? utcStringCache : stringCache,
      offsetlessAsUtc
    );
  }

  if (typeof input === "number") {
    return isTimestamp(input) ? input : undefined;
  }

  if (input instanceof Date) {
    const timestamp = input.getTime();
    return isTimestamp(timestamp) ? timestamp : undefined;
  }

  return undefined;
}

function parseInput(input: DateInput): number {
  const parsedTimestamp = parseInputSafe(input, false);
  if (parsedTimestamp !== undefined) return parsedTimestamp;

  if (typeof input === "string") {
    if (!input.trim()) throw new TypeError("Invalid date input.");
    throw new RangeError("Invalid date string.");
  }

  if (typeof input === "number") {
    throw new RangeError("Invalid date number.");
  }

  if (input instanceof Date) {
    throw new RangeError("Invalid date object.");
  }

  throw new TypeError("Invalid date input.");
}

function parseInputUtc(input: DateInput): number {
  const parsedTimestamp = parseInputSafe(input, true);
  if (parsedTimestamp !== undefined) return parsedTimestamp;

  if (typeof input === "string") {
    if (!input.trim()) throw new TypeError("Invalid date input.");
    throw new RangeError("Invalid date string.");
  }

  return parseInput(input);
}

const localeCache = new Cache<string, string>(16);
const zoneCache = new Cache<string, string>(16);

function fromIntl(
  raw: string,
  cache: Cache<string, string>,
  resolve: (value: string) => string,
  error: string
): string {
  if (typeof raw !== "string" || !raw.trim()) {
    throw new TypeError(error);
  }

  const value = raw.trim();
  const cached = cache.get(value);
  if (cached) return cached;

  try {
    const normalized = resolve(value);
    cache.set(value, normalized);
    return normalized;
  } catch {
    throw new RangeError(error);
  }
}

function normalizeLocale(locale: string): string {
  return fromIntl(
    locale,
    localeCache,
    (value) => new Intl.DateTimeFormat(value).resolvedOptions().locale,
    "Invalid locale code."
  );
}

function normalizeZone(zone: string): string {
  return fromIntl(
    zone,
    zoneCache,
    (value) =>
      new Intl.DateTimeFormat(undefined, { timeZone: value }).resolvedOptions()
        .timeZone,
    "Invalid time zone."
  );
}

const offsetCache = new Cache<string, number>(512);
const formatterCache = new Cache<string, Intl.DateTimeFormat>(12);
const OFFSET_CHUNK = 15 * MS_MINUTE;

function formatterFor(locale: string, zone: string): Intl.DateTimeFormat {
  const key = locale + "$" + zone;

  let formatter = formatterCache.get(key);
  if (formatter) return formatter;

  formatter = new Intl.DateTimeFormat(locale, {
    hour12: false,
    timeZone: zone,
    calendar: "gregory",
    numberingSystem: "latn",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit"
  });

  formatterCache.set(key, formatter);
  return formatter;
}

function utcParts(timestamp: number): DateParts {
  const date = new Date(timestamp);

  return {
    year: date.getUTCFullYear(),
    month: date.getUTCMonth() + 1,
    day: date.getUTCDate(),
    hour: date.getUTCHours(),
    minute: date.getUTCMinutes(),
    second: date.getUTCSeconds(),
    millisecond: date.getUTCMilliseconds()
  };
}

function parseParts(parts: Intl.DateTimeFormatPart[]): DateParts {
  const result: DateParts = {
    year: 0,
    month: 0,
    day: 0,
    hour: 0,
    minute: 0,
    second: 0,
    millisecond: 0
  };

  for (const part of parts) {
    const numericValue = +part.value;
    if (Number.isNaN(numericValue)) continue;

    if (part.type === "hour") {
      // some engines return 24:00 instead of 00:00.
      result.hour = numericValue === 24 ? 0 : numericValue;
      continue;
    }

    if (
      part.type !== "year" &&
      part.type !== "month" &&
      part.type !== "day" &&
      part.type !== "minute" &&
      part.type !== "second"
    ) {
      continue;
    }
    (result as unknown as Record<string, number>)[part.type] = numericValue;
  }

  return result;
}

function utcStamp(wall: DateParts): number {
  return (
    partsStamp(
      wall.year,
      wall.month,
      wall.day,
      wall.hour,
      wall.minute,
      wall.second,
      wall.millisecond,
      true
    ) ?? Number.NaN
  );
}

function zoneSample(
  timestamp: number,
  formatter: Intl.DateTimeFormat
): { components: DateParts; offsetMs: number } {
  const date = new Date(timestamp);
  const parts = formatter.formatToParts(date);
  const parsed = parseParts(parts);

  parsed.millisecond = date.getUTCMilliseconds();

  const wallStamp = utcStamp(parsed);
  return { components: parsed, offsetMs: wallStamp - timestamp };
}

function parseZoneParts(
  timestamp: number,
  zone: string,
  locale: string
): DateParts {
  if (zone === "UTC") return utcParts(timestamp);

  const formatter = formatterFor(locale, zone);
  const sample = (value: number) => zoneSample(value, formatter);

  // cache offsets in 15-mins chunks.
  const chunkIndex = Math.floor(timestamp / OFFSET_CHUNK);
  const cacheKey = zone + "$" + String(chunkIndex);

  const cachedOffset = offsetCache.get(cacheKey);
  if (cachedOffset !== undefined) {
    if (Number.isNaN(cachedOffset)) return sample(timestamp).components;
    return utcParts(timestamp + cachedOffset);
  }

  const currentSample = sample(timestamp);
  const chunkStart = chunkIndex * OFFSET_CHUNK;
  const chunkEnd = chunkStart + OFFSET_CHUNK - 1;

  const startOffset =
    chunkStart === timestamp
      ? currentSample.offsetMs
      : sample(chunkStart).offsetMs;
  const endOffset =
    chunkEnd === timestamp ? currentSample.offsetMs : sample(chunkEnd).offsetMs;

  offsetCache.set(
    cacheKey,
    startOffset === endOffset ? currentSample.offsetMs : Number.NaN
  );

  return currentSample.components;
}

function zoneOffsetSeconds(
  timestamp: number,
  zone: string,
  locale: string
): number {
  if (zone === "UTC") return 0;

  // offset = wall time - utc time
  return Math.round(
    (utcStamp(parseZoneParts(timestamp, zone, locale)) - timestamp) / MS_SECOND
  );
}

function wallToUtc(
  wall: DateParts,
  zone: string,
  locale: string,
  contextTimestamp?: number
): number {
  const wallTimestamp = utcStamp(wall);

  if (zone === "UTC") return wallTimestamp;

  // first, estimate from context.
  const firstOffset = zoneOffsetSeconds(
    contextTimestamp ?? wallTimestamp,
    zone,
    locale
  );
  let estimatedUtc = wallTimestamp - firstOffset * MS_SECOND;

  const checkOffset = zoneOffsetSeconds(estimatedUtc, zone, locale);

  if (checkOffset === firstOffset) return estimatedUtc;

  // refine when the first estimate crossed an offset boundary.
  estimatedUtc -= (checkOffset - firstOffset) * MS_SECOND;

  // resolve ambiguous fall-back transitions by preferring the smaller offset.
  const refinedOffset = zoneOffsetSeconds(estimatedUtc, zone, locale);
  return (
    wallTimestamp -
    (checkOffset === refinedOffset
      ? checkOffset
      : Math.min(checkOffset, refinedOffset)) *
      MS_SECOND
  );
}

function sameParts(left: DateParts, right: DateParts): boolean {
  return (
    left.year === right.year &&
    left.month === right.month &&
    left.day === right.day &&
    left.hour === right.hour &&
    left.minute === right.minute &&
    left.second === right.second &&
    left.millisecond === right.millisecond
  );
}

function resolveDisambiguation(value: unknown): Disambiguation {
  if (
    value === "compatible" ||
    value === "earlier" ||
    value === "later" ||
    value === "reject"
  ) {
    return value;
  }
  throw new RangeError("Invalid time-zone disambiguation.");
}

function resolveWallTime(
  wall: DateParts,
  zone: string,
  locale: string,
  disambiguation: Disambiguation
): number {
  const wallTimestamp = utcStamp(wall);
  if (!isTimestamp(wallTimestamp)) throw new RangeError("Invalid wall time.");
  if (zone === "UTC") return wallTimestamp;

  const offsets = new Set<number>();
  for (let hours = -48; hours <= 48; hours += 1) {
    const sampleTimestamp = wallTimestamp + hours * MS_HOUR;
    if (!isTimestamp(sampleTimestamp)) continue;

    const offset = zoneOffsetSeconds(sampleTimestamp, zone, locale);
    if (Number.isFinite(offset)) offsets.add(offset);
  }

  const candidates: number[] = [];
  const nearby: { timestamp: number; wallTimestamp: number }[] = [];

  for (const offset of offsets) {
    const timestamp = wallTimestamp - offset * MS_SECOND;
    if (!isTimestamp(timestamp)) continue;

    const actual = parseZoneParts(timestamp, zone, locale);
    const actualWallTimestamp = utcStamp(actual);
    if (sameParts(actual, wall)) candidates.push(timestamp);
    else if (isTimestamp(actualWallTimestamp)) {
      nearby.push({ timestamp, wallTimestamp: actualWallTimestamp });
    }
  }

  candidates.sort((left, right) => left - right);
  if (candidates.length > 0) {
    if (disambiguation === "reject" && candidates.length > 1) {
      throw new RangeError("Ambiguous wall time.");
    }
    const selected =
      disambiguation === "later"
        ? candidates[candidates.length - 1]
        : candidates[0];
    if (selected === undefined) throw new RangeError("Nonexistent wall time.");
    return selected;
  }

  if (disambiguation === "reject") {
    throw new RangeError("Nonexistent wall time.");
  }

  const isEarlier = disambiguation === "earlier";
  const matches = nearby
    .filter(({ wallTimestamp: actual }) =>
      isEarlier ? actual < wallTimestamp : actual > wallTimestamp
    )
    .sort((left, right) =>
      isEarlier
        ? right.wallTimestamp - left.wallTimestamp
        : left.wallTimestamp - right.wallTimestamp
    );

  const match = matches[0];
  if (!match) throw new RangeError("Nonexistent wall time.");
  return match.timestamp;
}

type Calendar = "month" | "year";

function isLeapYear(year: number): boolean {
  return !(year & 3) && (year % 100 !== 0 || year % 400 === 0);
}

function monthEnd(year: number, month: number, utc: boolean): number {
  return utc
    ? new Date(Date.UTC(year, month, 0)).getUTCDate()
    : new Date(year, month, 0).getDate();
}

function clampCalendar(
  date: Date,
  value: number,
  unit: Calendar,
  utc: boolean
): void {
  if (unit === "year") {
    const currentYear = utc ? date.getUTCFullYear() : date.getFullYear();
    const currentMonth = utc ? date.getUTCMonth() : date.getMonth();
    const currentDay = utc ? date.getUTCDate() : date.getDate();

    const targetYear = currentYear + value;

    if (currentMonth === 1 && currentDay === 29 && !isLeapYear(targetYear)) {
      if (utc) date.setUTCDate(28);
      else date.setDate(28);
    }

    if (utc) date.setUTCFullYear(targetYear);
    else date.setFullYear(targetYear);
    return;
  }

  const currentDay = utc ? date.getUTCDate() : date.getDate();
  const currentMonth = utc ? date.getUTCMonth() : date.getMonth();

  if (utc) {
    date.setUTCDate(1);
    date.setUTCMonth(currentMonth + value);
  } else {
    date.setDate(1);
    date.setMonth(currentMonth + value);
  }

  const lastDay = monthEnd(
    utc ? date.getUTCFullYear() : date.getFullYear(),
    (utc ? date.getUTCMonth() : date.getMonth()) + 1,
    utc
  );

  const targetDay = Math.min(currentDay, lastDay);
  if (utc) date.setUTCDate(targetDay);
  else date.setDate(targetDay);
}

function shiftZone(
  timestamp: number,
  duration: CanonicalDuration,
  zone: string,
  locale: string,
  direction: 1 | -1
): number {
  const milliseconds = duration.millisecond ?? 0;
  const seconds = duration.second ?? 0;
  const minutes = duration.minute ?? 0;
  const hours = duration.hour ?? 0;

  const elapsedMs =
    milliseconds + seconds * MS_SECOND + minutes * MS_MINUTE + hours * MS_HOUR;

  const shiftedStamp = timestamp + direction * elapsedMs;

  const dayShift = duration.day ?? 0;
  const monthShift = duration.month ?? 0;
  const yearShift = duration.year ?? 0;

  if (dayShift === 0 && monthShift === 0 && yearShift === 0) {
    return shiftedStamp;
  }

  if (zone === "UTC") {
    const utcDate = new Date(shiftedStamp);

    if (dayShift !== 0)
      utcDate.setUTCDate(utcDate.getUTCDate() + direction * dayShift);
    if (monthShift !== 0)
      clampCalendar(utcDate, direction * monthShift, "month", true);
    if (yearShift !== 0)
      clampCalendar(utcDate, direction * yearShift, "year", true);

    return utcDate.getTime();
  }

  const shiftedWall = parseZoneParts(shiftedStamp, zone, locale);
  const wallDate = new Date(
    Date.UTC(
      shiftedWall.year,
      shiftedWall.month - 1,
      shiftedWall.day,
      shiftedWall.hour,
      shiftedWall.minute,
      shiftedWall.second,
      shiftedWall.millisecond
    )
  );

  if (dayShift !== 0)
    wallDate.setUTCDate(wallDate.getUTCDate() + direction * dayShift);
  if (monthShift !== 0)
    clampCalendar(wallDate, direction * monthShift, "month", true);
  if (yearShift !== 0)
    clampCalendar(wallDate, direction * yearShift, "year", true);

  return wallToUtc(
    {
      year: wallDate.getUTCFullYear(),
      month: wallDate.getUTCMonth() + 1,
      day: wallDate.getUTCDate(),
      hour: wallDate.getUTCHours(),
      minute: wallDate.getUTCMinutes(),
      second: wallDate.getUTCSeconds(),
      millisecond: wallDate.getUTCMilliseconds()
    },
    zone,
    locale,
    shiftedStamp
  );
}

function diffCalendar(
  leftTimestamp: number,
  rightTimestamp: number,
  zone: string,
  locale: string,
  unit: Calendar,
  leftComponents?: DateParts,
  rightComponents?: DateParts
): number {
  const leftWall =
    leftComponents ?? parseZoneParts(leftTimestamp, zone, locale);
  const rightWall =
    rightComponents ?? parseZoneParts(rightTimestamp, zone, locale);

  let unitDiff =
    unit === "year"
      ? leftWall.year - rightWall.year
      : (leftWall.year - rightWall.year) * 12 +
        (leftWall.month - rightWall.month);

  if (unitDiff === 0) return 0;

  const anchoredTimestamp = shiftZone(
    rightTimestamp,
    unit === "year" ? { year: unitDiff } : { month: unitDiff },
    zone,
    locale,
    1
  );

  if (leftTimestamp >= rightTimestamp) {
    if (anchoredTimestamp > leftTimestamp) unitDiff -= 1;
    return unitDiff;
  }

  if (anchoredTimestamp < leftTimestamp) unitDiff += 1;

  return unitDiff;
}

const CANONICAL_MAP: Record<CanonicalUnit, 1> = {
  millisecond: 1,
  second: 1,
  minute: 1,
  hour: 1,
  day: 1,
  month: 1,
  year: 1
};

function normalizeUnit(unit: Unit): CanonicalUnit {
  const key = unit.trim().toLowerCase();

  if (key in CANONICAL_MAP) {
    return key as CanonicalUnit;
  }

  if (key.endsWith("s")) {
    const singular = key.slice(0, -1);
    if (singular in CANONICAL_MAP) {
      return singular as CanonicalUnit;
    }
  }

  throw new RangeError("Invalid unit.");
}

function normalizeDuration(duration: Duration): CanonicalDuration {
  if (typeof duration !== "object") {
    throw new TypeError("Invalid duration.");
  }

  const normalized: CanonicalDuration = {};

  for (const [rawUnit, value] of Object.entries(duration)) {
    if (typeof value !== "number" || !Number.isFinite(value)) {
      throw new RangeError("Invalid duration value.");
    }

    const unit = normalizeUnit(rawUnit as Unit);

    normalized[unit] = (normalized[unit] ?? 0) + value;
  }

  return normalized;
}

const patternCache = new Cache<string, readonly PatternFn[]>(24);

const TOKEN_REGEX =
  /\[([^\]]+)\]|YYYY|YY|Q|MM|M|DD|D|HH|H|hh|h|mm|m|ss|s|SSS|ZZ|Z|X|x/g;

function formatOffset(seconds: number, compact = false): string {
  const sign = seconds >= 0 ? "+" : "-";
  const abs = Math.abs(seconds);

  const hour = Math.floor(abs / 3600);
  const minute = Math.floor((abs % 3600) / 60);
  const second = abs % 60;
  const separator = compact ? "" : ":";

  const hh = String(hour).padStart(2, "0");
  const mm = String(minute).padStart(2, "0");
  const prefix = `${sign}${hh}${separator}${mm}`;

  if (second === 0) return prefix;
  return `${prefix}${separator}${String(second).padStart(2, "0")}`;
}

const TOKEN_FORMATTERS: Record<string, PatternFn> = {
  YYYY: (component) => String(component.year).padStart(4, "0"),
  YY: (component) => String(component.year).slice(-2),

  MM: (component) => String(component.month).padStart(2, "0"),
  M: (component) => String(component.month),
  Q: (component) => String(Math.ceil(component.month / 3)),

  DD: (component) => String(component.day).padStart(2, "0"),
  D: (component) => String(component.day),

  HH: (component) => String(component.hour).padStart(2, "0"),
  H: (component) => String(component.hour),
  hh: (component) => String(component.hour % 12 || 12).padStart(2, "0"),
  h: (component) => String(component.hour % 12 || 12),

  mm: (component) => String(component.minute).padStart(2, "0"),
  m: (component) => String(component.minute),

  ss: (component) => String(component.second).padStart(2, "0"),
  s: (component) => String(component.second),

  SSS: (component) => String(component.millisecond).padStart(3, "0"),
  X: (_, timestamp) => String(Math.floor(timestamp / MS_SECOND)),
  x: (_, timestamp) => String(timestamp),

  ZZ: (_, timestamp, zone, locale) =>
    formatOffset(zoneOffsetSeconds(timestamp, zone, locale), true),
  Z: (_, timestamp, zone, locale) =>
    formatOffset(zoneOffsetSeconds(timestamp, zone, locale))
};

function compilePattern(pattern: string): readonly PatternFn[] {
  const parts: PatternFn[] = [];
  let fromIndex = 0;

  TOKEN_REGEX.lastIndex = 0;
  let match: RegExpExecArray | null = TOKEN_REGEX.exec(pattern);

  while (match !== null) {
    const tokenStart = match.index;
    const token = match[0];
    const escaped = match[1];

    if (tokenStart > fromIndex) {
      const staticText = pattern.slice(fromIndex, tokenStart);
      parts.push(() => staticText);
    }

    if (escaped !== undefined) {
      parts.push(() => escaped);
    } else {
      const formatter = TOKEN_FORMATTERS[token];
      if (formatter) parts.push(formatter);
    }

    fromIndex = TOKEN_REGEX.lastIndex;
    match = TOKEN_REGEX.exec(pattern);
  }

  if (fromIndex < pattern.length) {
    const remainingText = pattern.slice(fromIndex);
    parts.push(() => remainingText);
  }

  return parts;
}

function formatPattern(
  timestamp: number,
  locale: string,
  zone: string,
  pattern: string,
  components?: DateParts
): string {
  const resolvedComponents =
    components ?? parseZoneParts(timestamp, zone, locale);

  let formatParts = patternCache.get(pattern);
  if (!formatParts) {
    formatParts = compilePattern(pattern);
    patternCache.set(pattern, formatParts);
  }

  let result = "";
  for (const part of formatParts) {
    result += part(resolvedComponents, timestamp, zone, locale);
  }

  return result;
}

const api: Api = {
  createCache: <K, V>(size: number) => new Cache<K, V>(size),
  parseInput,
  normalizeUnit,
  normalizeLocale,
  parseZoneParts,
  wallToUtc,
  monthEnd,
  constants: {
    MS_SECOND,
    MS_MINUTE,
    MS_HOUR,
    MS_DAY
  }
};

export type Plugin = (waktos: typeof Waktos, api: Api) => void;

export interface Extensions {
  readonly __extensions?: undefined;
}

// eslint-disable-next-line @typescript-eslint/no-unsafe-declaration-merging
class Waktos {
  private readonly timestamp: number;
  private readonly localeCode: string;
  private readonly zoneCode: string;

  private componentsCached?: DateParts;
  private components(): DateParts {
    const cached = this.componentsCached;
    if (cached) return cached;

    const components = parseZoneParts(
      this.timestamp,
      this.zoneCode,
      this.localeCode
    );

    this.componentsCached = components;
    return components;
  }

  private contextParts(
    input: DateInput | Waktos,
    inputTimestamp: number
  ): DateParts {
    if (
      input instanceof Waktos &&
      input.zoneCode === this.zoneCode &&
      input.localeCode === this.localeCode
    ) {
      return input.components();
    }

    return parseZoneParts(inputTimestamp, this.zoneCode, this.localeCode);
  }

  private constructor(timestamp: number, locale: string, zone: string) {
    if (!isTimestamp(timestamp))
      throw new RangeError("Invalid date timestamp.");
    this.timestamp = timestamp;
    this.localeCode = locale;
    this.zoneCode = zone;
  }

  private static resolveTimestamp(value: DateInput | Waktos): number {
    return value instanceof Waktos ? value.timestamp : parseInput(value);
  }

  private static resolveUtcTimestamp(value: DateInput | Waktos): number {
    return value instanceof Waktos ? value.timestamp : parseInputUtc(value);
  }

  private static readonly installedPlugin = new Set<Plugin>();

  static now(): Waktos {
    return new Waktos(Date.now(), LOCALE, ZONE);
  }

  static local(input: DateInput | Waktos): Waktos {
    return new Waktos(Waktos.resolveTimestamp(input), LOCALE, ZONE);
  }

  static utc(input: DateInput | Waktos): Waktos {
    return new Waktos(Waktos.resolveUtcTimestamp(input), LOCALE, "UTC");
  }

  static zoned(
    input: string,
    zoneCode: string,
    disambiguation: Disambiguation = "compatible"
  ): Waktos {
    const zone = normalizeZone(zoneCode);
    const wall = parseWallString(input);
    const timestamp = resolveWallTime(
      wall,
      zone,
      LOCALE,
      resolveDisambiguation(disambiguation)
    );
    return new Waktos(timestamp, LOCALE, zone);
  }

  static from(input: DateInput | Waktos): Waktos {
    return new Waktos(Waktos.resolveTimestamp(input), LOCALE, ZONE);
  }

  static isValid(input: unknown): boolean {
    if (input instanceof Waktos) return true;
    return parseInputSafe(input, false) !== undefined;
  }

  static extend(plugin: Plugin | readonly Plugin[]): typeof Waktos {
    const plugins: readonly Plugin[] =
      typeof plugin === "function" ? [plugin] : plugin;

    for (const entry of plugins) {
      if (typeof entry !== "function")
        throw new TypeError("Invalid plugin entry.");

      if (this.installedPlugin.has(entry)) continue;

      entry(this, api);
      this.installedPlugin.add(entry);
    }

    return this;
  }

  static ordinal(localeCode: string, handler: OrdinalFn): typeof Waktos {
    void localeCode;
    void handler;
    throw new Error("'ordinalFormat' plugin is not installed.");
  }

  public locale(localeCode: string): Waktos {
    return new Waktos(
      this.timestamp,
      normalizeLocale(localeCode),
      this.zoneCode
    );
  }

  public zone(zoneCode: string): Waktos {
    return new Waktos(this.timestamp, this.localeCode, normalizeZone(zoneCode));
  }

  public local(): Waktos {
    return new Waktos(this.timestamp, this.localeCode, ZONE);
  }

  public utc(): Waktos {
    return new Waktos(this.timestamp, this.localeCode, "UTC");
  }

  public add(duration: Duration): Waktos {
    const normalizedDuration = normalizeDuration(duration);

    const timestamp = shiftZone(
      this.timestamp,
      normalizedDuration,
      this.zoneCode,
      this.localeCode,
      1
    );
    return new Waktos(timestamp, this.localeCode, this.zoneCode);
  }

  public subtract(duration: Duration): Waktos {
    const normalizedDuration = normalizeDuration(duration);

    const timestamp = shiftZone(
      this.timestamp,
      normalizedDuration,
      this.zoneCode,
      this.localeCode,
      -1
    );
    return new Waktos(timestamp, this.localeCode, this.zoneCode);
  }

  public diff(other: DateInput | Waktos, unit: Unit): number {
    const normalizedUnit = normalizeUnit(unit);
    const otherTimestamp = Waktos.resolveTimestamp(other);
    const deltaMs = this.timestamp - otherTimestamp;
    if (normalizedUnit === "millisecond") return deltaMs;
    if (normalizedUnit === "second") return deltaMs / MS_SECOND;
    if (normalizedUnit === "minute") return deltaMs / MS_MINUTE;
    if (normalizedUnit === "hour") return deltaMs / MS_HOUR;
    if (normalizedUnit === "day") return deltaMs / MS_DAY;

    const calendarUnit: "month" | "year" =
      normalizedUnit === "month" ? "month" : "year";

    return diffCalendar(
      this.timestamp,
      otherTimestamp,
      this.zoneCode,
      this.localeCode,
      calendarUnit,
      this.components(),
      this.contextParts(other, otherTimestamp)
    );
  }

  public isBefore(other: DateInput | Waktos): boolean {
    return this.timestamp < Waktos.resolveTimestamp(other);
  }

  public isAfter(other: DateInput | Waktos): boolean {
    return this.timestamp > Waktos.resolveTimestamp(other);
  }

  public isSame(other: DateInput | Waktos): boolean {
    return this.timestamp === Waktos.resolveTimestamp(other);
  }

  public format(pattern: string): string {
    if (!pattern || typeof pattern !== "string")
      throw new TypeError("Invalid format pattern.");

    return formatPattern(
      this.timestamp,
      this.localeCode,
      this.zoneCode,
      pattern
    );
  }

  public toString(): string {
    return this.format("YYYY-MM-DDTHH:mm:ss.SSSZ");
  }

  public toISOString(): string {
    return new Date(this.timestamp).toISOString();
  }

  public toJSON(): string {
    return this.toISOString();
  }

  public toDate(): Date {
    return new Date(this.timestamp);
  }

  public valueOf(): number {
    return this.timestamp;
  }

  public context(): { locale: string; zone: string } {
    return { locale: this.localeCode, zone: this.zoneCode };
  }
}

// eslint-disable-next-line @typescript-eslint/no-unsafe-declaration-merging
interface Waktos extends Extensions {
  readonly __waktos?: undefined;
}

export default Waktos;
export type {
  DateInput,
  DateParts,
  Disambiguation,
  Duration,
  OrdinalFn,
  PluginCache,
  Unit
};
