import { DateInput, DateValidation } from '../types';

class DateValidator implements DateValidation {
  public isValid(date: DateInput): boolean {
    // Catches both null/undefined—
    // And invalid date strings
    return (
      date != null &&
      !isNaN((date instanceof Date ? date : new Date(date)).getTime())
    );
  }
}

// Exported for internal and testing usage
export const dateValidator = new DateValidator();
