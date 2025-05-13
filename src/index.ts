import { DateInput, AbsoluteOptions, RelativeOptions } from './types';
import { absolute } from './formatters/absolute';
import { relative } from './formatters/relative';
import { getOrdinal } from './utils/ordinal';

export { DateInput, AbsoluteOptions, RelativeOptions } from './types';
export { absolute } from './formatters/absolute';
export { relative } from './formatters/relative';
export { getOrdinal, formatOrdinal } from './utils/ordinal';

class Waktos {
  public constructor(private date: DateInput) {}

  public format(
    type: 'relative' | 'absolute',
    options?: RelativeOptions | AbsoluteOptions,
  ): string {
    return type === 'relative'
      ? relative(this.date, options as RelativeOptions)
      : absolute(this.date, options as AbsoluteOptions);
  }

  public absolute(options?: AbsoluteOptions): string {
    return absolute(this.date, options);
  }

  public relative(options?: RelativeOptions): string {
    return relative(this.date, options);
  }

  public getOrdinal(n: number): string {
    return getOrdinal(n);
  }
}

export const waktos = Object.assign(
  (date: DateInput): Waktos => new Waktos(date),
  {
    absolute,
    relative,
    getOrdinal,
  },
);

export default waktos;
