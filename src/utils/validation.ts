import { DateInput, DateValidation } from '../types';

class DateValidator implements DateValidation {
  public isValid(date: DateInput): boolean {
    if (date == null) return false;

    try {
      const dateObj = date instanceof Date ? date : new Date(date);
      return !isNaN(dateObj.getTime());
    } catch (_) {
      return false;
    }
  }
}

export const dateValidator = new DateValidator();
