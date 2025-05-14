# Waktos

> Simple, friendly date formatting without the bulk.

## 🔍 Overview

Focused exclusively on date formatting, keeping the library small and specialized. If you only need to display dates in a human-friendly way, **Waktos** gives you exactly what you need without the extra weight.

| Feature                 |           Waktos            | Common in Other Libraries  |
| ----------------------- | :-------------------------: | :------------------------: |
| **Bundle Size**         |           `~2 kB`           |    Typically `6-70 kB`     |
| **Dependencies**        |            None             | Typically none to several  |
| **Relative Formatting** |             Yes             |            Yes             |
| **Absolute Formatting** |             Yes             |            Yes             |
| **Timezone Support**    |       Via `Intl` API        |    Via various methods     |
| **Date Arithmetic**     |             No              |   Yes (often extensive)    |
| **Date Validation**     |            Basic            |  Typically comprehensive   |
| **Date Parsing**        |            Basic            |  Typically comprehensive   |
| **TypeScript Support**  |    Full type definitions    |     Varies by library      |
| **Locale Support**      | `en-US` only (more planned) | Often via additional files |
| **Tree-Shaking**        |             Yes             |  Varies by implementation  |

| Use Case                      | Strengths                                           | Considerations                             |
| ----------------------------- | --------------------------------------------------- | ------------------------------------------ |
| **Performance-critical apps** | Ultra-lightweight                                   | Focused on formatting only                 |
| **Simple formatting needs**   | Clean, intuitive API with minimal learning curve    | Specialized rather than all-purpose        |
| **Human-readable displays**   | Natural language formats                            | Formatting-first approach                  |
| **Modern application stacks** | Full TypeScript support with excellent tree-shaking | Newer library with active development      |
| **PWAs and mobile sites**     | Optimized for size-sensitive environments           | Prioritizes essential features over extras |

## 🚀 Quick Start

```bash
npm install waktos # or pnpm add waktos
```

```javascript
import { relative, absolute, waktos } from 'waktos';

// Format in one line:
relative(new Date()); // "just now"
```

> [!NOTE]
>
> - **Node** 16+ (recommended 18+)
> - **TypeScript** 4.7.0+ (recommended 5+)

## ✨ Key Features

### Examples

```javascript
// Social media comment timestamp
function Comment({ text, createdAt }) {
  return (
    <div className="comment">
      <p>{text}</p>
      <span className="timestamp">{relative(createdAt)}</span>{' '}
      {/* "2 hours ago" */}
    </div>
  );
}

// Event calendar
function EventCard({ event }) {
  return (
    <div className="event-card">
      <h3>{event.title}</h3>
      <time dateTime={event.startTime.toISOString()}>
        {absolute(event.startTime, { format: 'full', includeTime: true })}
      </time>
    </div>
  );
}
```

### Natural Relative Time

Ideal for social media, comments, notifications and activity feeds:

```javascript
relative(new Date(Date.now() - 30 * 1000)); // "just now"
relative(new Date(Date.now() - 2 * 60 * 60 * 1000)); // "a few hours ago"
relative(new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)); // "yesterday"
relative(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)); // "a week ago"
relative(new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)); // "in 3 days"
```

Customize with timezone and reference date:

```javascript
relative(eventDate, {
  timezone: 'America/New_York', // In user's timezone
  now: referenceDate, // Compare against specific date
});
```

### Flexible Calendar Formats

Perfect for event displays, schedules, and more formal date presentations:

```javascript
// Choose from four preset formats
absolute(date, { format: 'short' }); // "5/10/2025"
absolute(date, { format: 'medium' }); // "May 10, 2025"
absolute(date, { format: 'long' }); // "May 10, 2025"
absolute(date, { format: 'full' }); // "Saturday, May 10, 2025"

// Mix and match options to get exactly what you need
absolute(date, {
  format: 'medium',
  includeTime: true, // Add time: "May 10, 2025, 2:30 PM"
  includeOrdinal: true, // Add ordinal: "May 10th, 2025"
  includeWeekday: true, // Add day name: "Saturday, May 10, 2025"
  timezone: 'Asia/Tokyo', // Use specific timezone
});
```

### Multiple API Styles

Both functional and object-oriented approaches:

```javascript
// Method 1: Functional (cleaner for one-time formatting)
relative(commentDate);

// Method 2: OOP (cleaner for multiple operations)
import { waktos } from 'waktos';

const formatter = waktos(eventDate);
formatter.relative();
formatter.absolute({ includeTime: true });
```

## 📝 API Reference

### Options

| Option           | API                    | Values                                            | Default            | Description                              |
| ---------------- | ---------------------- | ------------------------------------------------- | ------------------ | ---------------------------------------- |
| `format`         | `absolute`             | `'short'`, `'medium'`, `'long'`, `'full'`         | `'medium'`         | Date format preset to use                |
| `includeTime`    | `absolute`             | `boolean`                                         | `false`            | Include time in formatted date           |
| `includeWeekday` | `absolute`             | `boolean`                                         | `false`            | Include day of the week (e.g., "Monday") |
| `includeOrdinal` | `absolute`             | `boolean`                                         | `false`            | Add ordinal suffix to day (e.g., "1st")  |
| `timezone`       | `absolute`, `relative` | IANA timezone string (e.g., `'America/New_York'`) | Browser's timezone | Timezone to use for formatting           |
| `now`            | `relative`             | `Date`                                            | Current time       | Reference point for relative time        |

### Functions

| Function/Method            | Parameters                                       | Return Type | Description                                       |
| -------------------------- | ------------------------------------------------ | ----------- | ------------------------------------------------- |
| `relative(date, options?)` | `date: DateInput`<br>`options?: RelativeOptions` | `string`    | Format date relative to now or reference point    |
| `absolute(date, options?)` | `date: DateInput`<br>`options?: AbsoluteOptions` | `string`    | Format date in calendar format with options       |
| `waktos(date)`             | `date: DateInput`                                | `Waktos`    | Create a formatter instance for the given date    |
| `getOrdinal(n)`            | `n: number`                                      | `string`    | Get ordinal suffix (e.g., "st", "nd", "rd", "th") |
| `formatOrdinal(n)`         | `n: number`                                      | `string`    | Format number with ordinal suffix (e.g., "1st")   |

### Input Types

| Type               | Example                  | Support              |
| ------------------ | ------------------------ | -------------------- |
| `Date` object      | `new Date()`             | Full support         |
| Timestamp (number) | `1620000000000`          | Full support         |
| ISO string         | `'2025-05-10T14:30:00Z'` | Full support         |
| `null`             | `null`                   | Returns empty string |
| `undefined`        | `undefined`              | Returns empty string |

## 🤝 Contributing

Contributions welcome! Fork the repo, make your changes, ensure tests pass, and submit a PRs. Please maintain test coverage and follow the existing code style.

---

[MIT License](LICENSE)
