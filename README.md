# Waktos ⏰

[![npm version](https://img.shields.io/npm/v/waktos.svg)](https://www.npmjs.com/package/waktos)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Downloads](https://img.shields.io/npm/dm/waktos.svg)](https://www.npmjs.com/package/waktos)

> ~5kb for the death of ugly dates!

**Waktos** is a lightweight, immutable date manipulation library for JavaScript and TypeScript. Unlike native `Date` which is bound to the system's local time, **Waktos instances carry their own Timezone and Locale context**, ensuring consistent behavior across all operations.

- 🪶 **Lightweight** — Only ~5kb minified + gzipped
- 🌍 **Context Aware** — Operations respect the instance's specific Timezone & Locale
- 🧩 **Modular** — Tree-shakeable plugin architecture
- ⚡ **Fast** — Optimized performance with smart caching
- 🛡️ **Safe** — Immutable instances and first-class TypeScript support
- 🎯 **Simple** — Intuitive, chainable API that just works

## Quick Start ☕

```sh
npm i waktos
```

```js
import waktos from 'waktos';

// Current time in your system's timezone
const now = waktos();

// Explicitly set timezone and locale
const date = waktos('2005-04-26', {
  timezone: 'Asia/Jakarta',
  locale: 'id-ID',
});

console.log(date.format('PPPP')); // "Selasa, 26 April 2005"
```

## Why Waktos? 🌐

### Timezone & Locale Aware Architecture

Every Waktos instance "remembers" its configuration. Operations like `startOf`, `endOf`, or `add` calculate results based on the **instance's timezone**, not the server's or browser's local time.

```js
const timestamp = 1715000000000; // A specific moment in UTC

const ny = waktos(timestamp, { timezone: 'America/New_York' });
const tokyo = waktos(timestamp, { timezone: 'Asia/Tokyo' });

// Same moment, but different "start of day" depending on the timezone
console.log(ny.startOf('day').format()); // 2024-05-06T00:00:00-04:00
console.log(tokyo.startOf('day').format()); // 2024-05-06T00:00:00+09:00

// Formatting automatically uses the instance's locale
const fr = waktos(timestamp, { locale: 'fr-FR' });
console.log(fr.format('MMMM')); // "mai"
```

## Core Features 🚀

### Parsing & Creation

Waktos handles various input formats consistently.

```js
// Current time
waktos();

// Parse ISO string
waktos('2023-05-19T01:02:03+07:00');

// Parse local date (Midnight in the specified/local timezone)
const birthday = waktos('2005-04-26');

// Parse UTC date (Midnight UTC)
const utcBirthday = waktos.utc('2005-04-26');
```

### Intuitive Arithmetic

Perform date math without mutating the original instance.

```js
const date = waktos('2005-04-26');

const nextWeek = date.add(7, 'day');
const twoMonthsAgo = date.sub(2, 'month');
const startOfWeek = date.startOf('week'); // Respects locale's first day of week
const endOfMonth = date.endOf('month');
```

## Plugins 🔌

Waktos is extensible by design. Import only what you need.

```js
import waktos from 'waktos';
import businessTime from 'waktos/plugin/businessTime';

waktos.plugin(businessTime);

const date = waktos('2005-04-26');
console.log(date.isWeekday()); // true
console.log(date.quarterOfYear()); // 2
```

## Formatting ✨

Format dates using standard tokens. Waktos leverages `Intl.DateTimeFormat` for accurate localization.

```js
const date = waktos('2005-04-26');

// Localized Presets
date.format('P'); // "04/26/05"
date.format('PP'); // "Apr 26, 2005"
date.format('PPP'); // "April 26, 2005"
date.format('PPPP'); // "Tuesday, April 26, 2005"

// Custom Patterns
date.format('YYYY-MM-DD'); // "2005-04-26"
date.format('[Born on] dddd'); // "Born on Tuesday"
date.format('h:mm A Z'); // "12:00 AM +07:00"
```

## TypeScript Support 💙

Waktos is written in TypeScript and provides types out of the box.

```ts
import { type DateInput, type Waktos, waktos } from 'waktos';

const scheduleMeeting = (date: DateInput, duration: number): Waktos => {
  return waktos(date).add(duration, 'minute');
};
```

## Environment Support 🌐

- **Node.js**: 18+ (ESM & CommonJS)
- **Browsers**: Modern browsers (Chrome 85+, Firefox 79+, Safari 14+, Edge 85+)
- **Mobile**: iOS 14.7+, Android 85+

> [!NOTE]
> For legacy environments, ensure appropriate polyfills are available.

## Migration Guide 📦

### From Day.js

Migration is straightforward as Waktos shares a similar API philosophy.

```diff
-dayjs('2005-04-26').add(1, 'second');
+waktos('2005-04-26').add(1, 'second');
```

- **Differences:** Units are singular (e.g., `'day'`, not `'days'`) for consistency.

### From Native Date

Stop wrestling with mutable state and inconsistent parsing.

```diff
-const date = new Date('2005-04-26');
-date.setDate(date.getDate() + 99); // Mutates original date!
+waktos('2005-04-26').add(99, 'day'); // Returns new instance
```

## FAQ 🤔

**Q: Why another date library?**
A: To provide a modern, immutable, and lightweight alternative that explicitly handles Timezone and Locale context in every operation, fixing the common pitfalls of the native `Date` object.

**Q: How does it impact bundle size?**
A: Minimally. Waktos is modular and tree-shakeable. The core library is ~5kb (minified + gzipped), and you can import only the specific plugins and locales your app needs.

**Q: How does it handle Daylight Saving Time (DST)?**
A: Waktos is DST-aware. Arithmetic operations like `add(1, 'day')` preserve the same local time across DST transitions, while `add(24, 'hour')` follows absolute physical time. This ensures consistent behavior for both business logic and duration calculations.

---

**Issues or Feature Requests?**
Feel free to open an issue or submit a pull request on GitHub. 🤝

> Build faster. Ship cleaner. Don’t waste your waktos.
