import type Waktos from "..";
import type { Plugin } from "..";

const TOKEN_REGEX = /\[([^\]]+)\]|MMMM|MMM|dddd|ddd|B|b|zz|z|A|a/g;
const TOKEN_OPTIONS: Record<string, Intl.DateTimeFormatOptions> = {
  MMMM: { month: "long" },
  MMM: { month: "short" },
  dddd: { weekday: "long" },
  ddd: { weekday: "short" },
  B: { dayPeriod: "long" },
  b: { dayPeriod: "short" },
  zz: { timeZoneName: "long" },
  z: { timeZoneName: "short" },
  A: { hour: "numeric", hour12: true }
};

let installed = false;

function partValue(
  formatter: Intl.DateTimeFormat,
  date: Date,
  type: Intl.DateTimeFormatPartTypes
): string {
  return (
    formatter.formatToParts(date).find((part) => part.type === type)?.value ??
    ""
  );
}

const localizedTokens: Plugin = (waktos, api) => {
  const w = waktos.prototype;
  if (installed) return;

  const formatterCache = api.createCache<string, Intl.DateTimeFormat>(24);

  const formatterFor = (
    locale: string,
    zone: string,
    cacheToken: string,
    options: Intl.DateTimeFormatOptions
  ): Intl.DateTimeFormat => {
    const cacheKey = `${locale}$${zone}$${cacheToken}`;
    const cached = formatterCache.get(cacheKey);
    if (cached) return cached;
    const formatter = new Intl.DateTimeFormat(locale, {
      ...options,
      timeZone: zone
    });
    formatterCache.set(cacheKey, formatter);
    return formatter;
  };

  const baseFormat = Object.getOwnPropertyDescriptor(w, "format")?.value as
    | ((this: Waktos, pattern?: string) => string)
    | undefined;
  if (typeof baseFormat !== "function") return;

  Object.defineProperty(w, "format", {
    value(this: Waktos, pattern: string) {
      if (!pattern || typeof pattern !== "string")
        return baseFormat.call(this, pattern);

      const { locale, zone } = this.context();
      const date = this.toDate();

      return baseFormat.call(
        this,
        pattern.replace(TOKEN_REGEX, (match, escaped) => {
          if (escaped !== undefined) return match;

          const formatterToken = match === "a" ? "A" : match;
          if (!TOKEN_OPTIONS[formatterToken]) return match;

          const formatter = formatterFor(
            locale,
            zone,
            formatterToken,
            TOKEN_OPTIONS[formatterToken]
          );
          const bracketed = (value: string): string => `[${value}]`;
          const dayPeriod = (): string =>
            partValue(formatter, date, "dayPeriod");

          if (match === "A") return bracketed(dayPeriod().toUpperCase());
          if (match === "a") return bracketed(dayPeriod().toLowerCase());
          if (match === "B" || match === "b") return bracketed(dayPeriod());
          if (match === "z" || match === "zz")
            return bracketed(
              partValue(formatter, date, "timeZoneName") ||
                formatter.format(date)
            );
          return bracketed(formatter.format(date));
        })
      );
    }
  });

  installed = true;
};

export default localizedTokens;
