# Waktos ⏰

[![npm version](https://img.shields.io/npm/v/waktos.svg)](https://www.npmjs.com/package/waktos)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Downloads](https://img.shields.io/npm/dm/waktos.svg)](https://www.npmjs.com/package/waktos)

> ~5kb for the death of ugly dates!

Tired of wrestling with JavaScript dates? **Waktos** makes working with time actually enjoyable. From simple “add 1 second” to complex timezone juggling — it just works.

```sh
npm i waktos
```

## Quick Taste ☕

```js
import waktos from 'waktos';

// Create a date in your timezone
const now = waktos();
console.log(now.toString()); // "2025-08-16T10:30:45+07:00" (example)

// Pick any date, no more timezone headaches
const date = waktos('2005-04-26', { timezone: 'Asia/Jakarta' });
console.log(date.format('PPP')); // "April 26, 2005"
```

**That's it.** No setup. No tears. huft~

## Why?

- 🪶 **Lightweight** — Only ~5kb, tiny but mighty
- 🌍 **Global** — Any locale, every timezone, works everywhere
- 🧩 **Modular** — Import only what you need, tree-shake the rest
- ⚡ **Fast** — Smart caching, built for performance
- 🛡️ **Safe** — TypeScript-first, catches bugs before users do
- 🎯 **Simple** — API feels natural, no docs-diving required

## Master Dates in 5 Minutes 🚀

```js
// Create dates the obvious way
waktos(); // Right now with your timezone

const birthday = waktos('2005-04-26');

// Math that doesn’t hurt your brain
birthday.add(7, 'day'); // Next week
birthday.sub(2, 'month'); // Two months back
birthday.startOf('week'); // Monday morning
birthday.endOf('month'); // Last second of month

// Get exactly what you need
birthday.year(); // 2005
birthday.month(); // 4 (finally, 1-based like humans think!)
birthday.day(); // 26
```

## Extend in One Line 🔌

Extensible by design:

```js
import waktos from 'waktos';
import businessTime from 'waktos/plugin/businessTime';

waktos.plugin(businessTime);

waktos('2005-04-26').isWeekday(); // true
waktos('2005-04-26').quarterOfYear(); // Q2
```

## Format Dates Like a Designer ✨

```js
const date = waktos('2005-04-26');

// Presets that actually make sense
date.format('P'); // "04/26/05"
date.format('PP'); // "Apr 26, 2005"
date.format('PPP'); // "April 26, 2005"
date.format('PPPP'); // "Tuesday, April 26, 2005"

// Custom patterns/tokens
date.format('YYYY-MM-DD'); // "2005-04-26"
date.format('[Born on] dddd'); // "Born on Tuesday"
date.format('h:mm A Z'); // "12:00 AM +07:00"
```

> [!NOTE]
>
> Square brackets [text] keep text literal. No more escaping nightmares.

## TypeScript Support 💙

Type safety out of the box:

```ts
import { type DateInput, type Waktos, waktos } from 'waktos';

const scheduleMeeting = (date: DateInput, duration: number): Waktos => {
  return waktos(date).add(duration, 'minute');
};
```

## Environment Support 🌐

- **Node.js**: 18+ (ESM & CommonJS)  
- **Browsers**: Chrome 85+, Firefox 79+, Safari 14.7+, Edge 85+  
- **Mobile**: iOS 14.7+, Android 85+

```js
// Node.js ESM
import waktos from 'waktos';

// Node.js CommonJS
const waktos = require('waktos');
```

> [!NOTE]
>
> For older environments, use a modern bundler with appropriate polyfills.

## Switch in 2 Minutes 📦

### From Day.js

```diff
-dayjs('2005-04-26').add(1, 'second').toString();
-dayjs('2005-04-26').startOf('month');
+waktos('2005-04-26').add(1, 'second').toString();
+waktos('2005-04-26').startOf('month');
```

- Units are singular (more natural)
- Better TypeScript support, no extra `@types`
- Plugins unlock superpowers: `waktos.plugin(...)`

### From Native Date

```diff
-const date = new Date('2005-04-26');
-date.setDate(date.getDate() + 99); // Mutates! 😱
-date.toLocaleDateString('en-US');
+waktos('2005-04-26').add(99, 'day').toString(); // en-US default
```

## Quick FAQ 🤔

**Q: Why another date library?**  
A: Because JavaScript dates still suck in 2025, and we refuse to settle.

**Q: Is it actually 5kb?**  
A: Yes. Minified + gzipped. We care about bundle size.

**Q: Any breaking changes when migrating?**  
A: Minimal. Most stuff just works™.

---

Life is too short for ugly date code...

```js
const deadline = waktos('2023-05-18T23:59:59');
const now = waktos();

if (now.isBefore(deadline, 'day')) {
  console.log('☕ Still got time for coffee...');
} else {
  console.log('🔥 Deadline? What deadline?!');
}
```

---

Any issues? Missing your locale? Pull requests welcome! 🤝

---

> Build faster. Ship cleaner. Don’t waste your waktos :>
