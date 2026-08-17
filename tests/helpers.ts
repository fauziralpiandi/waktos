import Waktos, { type DateInput } from "../src";

export function asUtc(input: DateInput, locale = "en-US"): Waktos {
  return Waktos.from(input).locale(locale).utc();
}
