import type Waktos from "..";
import type { DateInput, Plugin } from "..";

declare module ".." {
  interface Extensions {
    fromNow(): string;
    from(input: DateInput | Waktos): string;
  }
}

const truncZero = (value: number): number =>
  value < 0 ? Math.ceil(value) : Math.floor(value);

const subText = (
  diffMs: number,
  locale: string,
  formatterFor: (localeCode: string) => Intl.RelativeTimeFormat,
  minuteMs: number,
  hourMs: number,
  secondMs: number
): string => {
  const abs = Math.abs(diffMs);
  const formatter = formatterFor(locale);

  if (abs < minuteMs) {
    return formatter.format(truncZero(diffMs / secondMs), "second");
  }

  if (abs < hourMs) {
    return formatter.format(truncZero(diffMs / minuteMs), "minute");
  }

  return formatter.format(truncZero(diffMs / hourMs), "hour");
};

const relativeTime: Plugin = (waktos, api) => {
  const w = waktos.prototype;
  if ("fromNow" in w && "from" in w) {
    return;
  }

  const {
    constants: { MS_SECOND, MS_MINUTE, MS_HOUR, MS_DAY }
  } = api;

  const formatterCache = api.createCache<string, Intl.RelativeTimeFormat>(24);

  const formatterFor = (locale: string): Intl.RelativeTimeFormat => {
    const key = `${locale}$long`;
    const cached = formatterCache.get(key);
    if (cached) return cached;

    const formatter = new Intl.RelativeTimeFormat(locale, {
      numeric: "auto"
    });
    formatterCache.set(key, formatter);
    return formatter;
  };

  const resolveInput = (
    value: DateInput | Waktos,
    locale: string,
    zone: string
  ): Waktos => {
    return (value instanceof waktos ? value : waktos.from(value))
      .locale(locale)
      .zone(zone);
  };

  Object.defineProperties(w, {
    from: {
      value(this: Waktos, input: DateInput | Waktos) {
        const { locale, zone } = this.context();
        const target = resolveInput(input, locale, zone);

        const diffMs = this.valueOf() - target.valueOf();
        const abs = Math.abs(diffMs);
        if (abs < MS_DAY)
          return subText(
            diffMs,
            locale,
            formatterFor,
            MS_MINUTE,
            MS_HOUR,
            MS_SECOND
          );

        const formatter = formatterFor(locale);

        const years = this.diff(target, "year");
        if (Math.abs(years) >= 1) return formatter.format(years, "year");

        const months = this.diff(target, "month");
        if (Math.abs(months) >= 1) return formatter.format(months, "month");

        const days = truncZero(this.diff(target, "day"));

        return formatter.format(days, "day");
      }
    },
    fromNow: {
      value(this: Waktos) {
        return this.from(Date.now());
      }
    }
  });
};

export default relativeTime;
