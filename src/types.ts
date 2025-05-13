export type DateInput = Date | number | string | undefined | null;
export type ValidDate = Date | number | string;
export type FormatStyle = 'short' | 'medium' | 'long' | 'full';

export interface FormatOptions {
  timezone?: string;
}

export interface RelativeOptions extends FormatOptions {
  now?: Date;
}

export interface AbsoluteOptions extends FormatOptions {
  format?: FormatStyle;
  includeTime?: boolean;
  includeWeekday?: boolean;
  includeOrdinal?: boolean;
}

export interface DateValidation {
  isValid(date: DateInput): boolean;
}
