import type Waktos from "..";
import type { OrdinalFn, Plugin } from "..";

const ORDINAL_REGEX = /\[([^\]]+)\]|([A-Za-z]+)o/g;
const INTEGER_REGEX = /^-?\d+$/;

const ordinalHandlers = new Map<string, OrdinalFn>();

let installed = false;

function resolveHandler(
  locale: string,
  normalizeLocale: (localeCode: string) => string
): OrdinalFn | undefined {
  const localeKey = normalizeLocale(locale);
  const exact = ordinalHandlers.get(localeKey);
  if (exact) return exact;

  const separatorIndex = localeKey.indexOf("-");
  return separatorIndex < 0
    ? undefined
    : ordinalHandlers.get(localeKey.slice(0, separatorIndex));
}

const ordinalFormat: Plugin = (waktos, api) => {
  const w = waktos.prototype;
  if (installed) return;

  const normalizeLocale = (localeCode: string): string =>
    api.normalizeLocale(localeCode);

  const baseFormat = Object.getOwnPropertyDescriptor(w, "format")?.value as
    | ((this: Waktos, pattern?: string) => string)
    | undefined;
  if (typeof baseFormat !== "function") return;

  Object.defineProperty(waktos, "ordinal", {
    value(locale: string, handler: OrdinalFn) {
      if (typeof handler !== "function")
        throw new TypeError("Invalid ordinal handler.");

      const normalizedLocale = api.normalizeLocale(locale);
      ordinalHandlers.set(normalizedLocale, handler);
      return this as typeof waktos;
    }
  });

  Object.defineProperty(w, "format", {
    value(this: Waktos, pattern: string) {
      if (!pattern || typeof pattern !== "string")
        return baseFormat.call(this, pattern);

      const handler = resolveHandler(this.context().locale, normalizeLocale);
      if (!handler) return baseFormat.call(this, pattern);

      return baseFormat.call(
        this,
        pattern.replace(ORDINAL_REGEX, (match, escaped, token) => {
          if (escaped !== undefined) return match;
          if (token === undefined) return match;

          const formattedToken = baseFormat.call(this, token);
          if (!INTEGER_REGEX.test(formattedToken)) return match;

          const numericValue = Number(formattedToken);
          return `[${handler(numericValue)}]`;
        })
      );
    }
  });

  installed = true;
};

export default ordinalFormat;
