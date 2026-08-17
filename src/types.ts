export type DateInput = Date | number | string;

export type Disambiguation = "compatible" | "earlier" | "later" | "reject";

export type IsoFormat = [
  string,
  string,
  string,
  string,
  string?,
  string?,
  string?,
  string?,
  string?,
  string?,
  string?,
  string?
];

export type CanonicalUnit =
  | "millisecond"
  | "second"
  | "minute"
  | "hour"
  | "day"
  | "month"
  | "year";

export type Unit = CanonicalUnit | `${CanonicalUnit}s`;

export type CanonicalDuration = Partial<Record<CanonicalUnit, number>>;

export type Duration = Partial<Record<Unit, number>>;

export type OrdinalFn = (value: number) => string;

export interface DateParts {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
  millisecond: number;
}

export type PatternFn = (
  components: DateParts,
  timestamp: number,
  zone: string,
  locale: string
) => string;

export interface PluginCache<K, V> {
  get(key: K): V | undefined;
  set(key: K, value: V): void;
}

export interface Api {
  parseInput(input: DateInput): number;
  normalizeUnit(unit: Unit): CanonicalUnit;
  normalizeLocale(locale: string): string;
  parseZoneParts(timestamp: number, zone: string, locale: string): DateParts;
  wallToUtc(
    wall: DateParts,
    zone: string,
    locale: string,
    contextTimestamp?: number
  ): number;
  monthEnd(year: number, month: number, utc: boolean): number;
  createCache<K, V>(size: number): PluginCache<K, V>;
  readonly constants: {
    readonly MS_SECOND: number;
    readonly MS_MINUTE: number;
    readonly MS_HOUR: number;
    readonly MS_DAY: number;
  };
}
