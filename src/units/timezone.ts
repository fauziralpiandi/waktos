export function convertToTimezone(date: Date, timezone: string): Date {
  try {
    try {
      new Intl.DateTimeFormat('en-US', { timeZone: timezone }).format(
        new Date(),
      );
    } catch (_) {
      return new Date(date);
    }

    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
      hour12: false,
    });

    const parts = formatter.formatToParts(date);

    const getDateValue = (
      parts: Intl.DateTimeFormatPart[],
      type: string,
    ): number => {
      const part = parts.find(p => p.type === type);
      return part ? parseInt(part.value, 10) : 0;
    };

    return new Date(
      getDateValue(parts, 'year'),
      getDateValue(parts, 'month') - 1,
      getDateValue(parts, 'day'),
      getDateValue(parts, 'hour'),
      getDateValue(parts, 'minute'),
      getDateValue(parts, 'second'),
    );
  } catch (_) {
    return new Date(date);
  }
}

export function adjustForDst(
  date1: Date,
  date2: Date,
  timezone: string,
): [Date, Date] {
  try {
    return [
      convertToTimezone(date1, timezone),
      convertToTimezone(date2, timezone),
    ];
  } catch (_) {
    return [new Date(date1), new Date(date2)];
  }
}
