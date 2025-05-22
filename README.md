# waktos

> Simple, friendly time formatting for human-readable display.

**Death to ugly dates!**

```js
console.log(
  'I spawned on', absolute(new Date('2005-04-26'))
); // I spawned on Tuesday, April 26, 2005

console.log(
  'That was', relative(new Date('2005-04-26')), ':>'
); // That was 20 years ago :>
```

Two intuitive functions that do exactly what you’d expect—perfect for UIs, blog posts, chat apps, and anything social.

## Quick Start

```bash
npm i waktos # or pnpm add waktos
```

```js
import { absolute, relative } from 'waktos';
```

### Absolute Formatting

```js
// Basic usage with current date
absolute(new Date()); // "Tuesday, May 21, 2025"

// With localization & timezone
absolute(new Date(), {
  locale: 'de-DE', // German locale
  timezone: 'Europe/Berlin', // Berlin timezone
}); // "Dienstag, 21. Mai 2025"

// Flexible input types
absolute(1714044600000); // Timestamp
absolute('2025-05-21T14:30:00Z'); // ISO string
absolute(new Date(2025, 4, 21)); // (JS) Date object
```

### Relative Formatting

```js
// Auto-adapts to time distance
relative(Date.now() - 30 * 1000); // "just now"
relative(Date.now() - 5 * 60 * 1000); // "5 minutes ago"
relative(Date.now() - 24 * 60 * 60 * 1000); // "yesterday"
relative(Date.now() - 7 * 24 * 60 * 60 * 1000); // "last week"
relative(Date.now() - 365 * 24 * 60 * 60 * 1000); // "last year"

// Localized output
relative(new Date(Date.now() - 5 * 60 * 1000), { locale: 'de-DE' });
// => "vor 5 Minuten"
```

> [!NOTE]
>
> Meant for easy-to-read display, not for exact time math. 🤓
