# Waktos ⏰

[![npm version](https://img.shields.io/npm/v/waktos.svg)](https://www.npmjs.com/package/waktos)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Downloads](https://img.shields.io/npm/dm/waktos.svg)](https://www.npmjs.com/package/waktos)

> ~5kb for the death of ugly dates!

Tired of wrestling with JavaScript dates? Waktos makes working with time actually enjoyable. From simple "add 1 second" to complex timezone juggling - it just works.

```sh
npm i waktos
```

## Quick Taste ☕

```js
import waktos from 'waktos';

// Don't waste your time on things that should be simple...

waktos('2005-04-26', { timezone: 'Asia/Jakarta' });

// No more timezone headaches!
```

**That's it.** No setup. No tears. huft~

## Why?!

- 🪶 **Lightweight** - Only ~5kb, tiny but mighty
- 🌍 **Global** - Any locale, every timezone, works everywhere
- 🧩 **Modular** - Import only what you need, tree-shake what you don't
- ⚡ **Optimal** - Smart caching, built for performance, makes others look slow
- 🛡️ **Safe** - Never breaks, TypeScript catches bugs before they reach users
- 🎯 **Simple** - API feels natural, no more docs diving

## Master Dates in 5 Minutes 🚀

```js
// Create dates the obvious way
waktos(); // Right now with your timezone

// Math that doesn't hurt your brain
birthday.add(7, 'day'); // Next week (duh)
birthday.sub(2, 'month'); // Two months back
birthday.startOf('week'); // Monday morning
birthday.endOf('month'); // Last second of month

// Get what you want, when you want it
birthday.year(); // 2005
birthday.month(); // 4 (finally, 1-based like humans think!)
birthday.day(); // 26
```

## Need More Power? Just Plug It In 🔌

Extensible in one line, powerful by design:

```js
import waktos from 'waktos';
import businessTime from 'waktos/plugin/businessTime';

waktos.plugin(businessTime /*, and more */);

waktos('2005-04-26').isWeekday(); // true (locale-aware weekends)
waktos('2005-04-26').quarterOfYear(); // Q2 (not QQ)
```

## Format Dates Like a Designer ✨

```js
// Presets that actually make sense
const date = waktos('2005-04-26');

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
> Square brackets `[text]` keep text literal - no more regex escaping nightmares! Your future self will send thank-you cards.

## For TypeScript Fanatics 💙

Full type safety out of the box (life's too short for runtime errors):

```ts
import { type DateInput, type Waktos, waktos } from 'waktos';

const scheduleMeeting = (date: DateInput, duration: number): Waktos => {
  return waktos(date).add(duration, 'minute'); // TypeScript knows exactly what this returns
};
```

## Environment Support 🌐

**Node.js**: 18+ (ESM & CommonJS)  
**Browsers**: Chrome 85+, Firefox 79+, Safari 14.7+, Edge 85+  
**Mobile**: iOS 14.7+, Android 85+

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

```js
// Before
dayjs('2005-04-26').add(1, 'second').toString();
dayjs('2005-04-26').startOf('month');

// After - same API, (but) better everything
waktos('2005-04-26').add(1, 'second').toString();
waktos('2005-04-26').startOf('month');

// Just try it!
```

**What changes (spoiler: almost nothing)**:

- Drop the plural from units (makes more sense anyway :))
- Better TypeScript support out of the box (no more `@types/whatever`)
- Plugins unlock superpowers: `waktos.plugin(here, here, and more...)`

### From Native Date

```js
// Before - the nightmare
const date = new Date('2005-04-26');
date.setDate(date.getDate() + 99); // Mutates! 😱
date.toLocaleDateString('en-US');

// After - how it should be
waktos('2005-04-26').add(99, 'day').toString();
```

## Quick FAQ 🤔

**Q: Why another date library?**  
A: Because JavaScript dates still suck in 2025, and we refuse to accept mediocrity!

**Q: Is it actually 5kb?**  
A: Yes! ~5kB minified + gzipped. We're as obsessed with bundle size as you are.

**Q: Any breaking changes when migrating?**  
A: Minimal. Most stuff just works™

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

> **By time. Indeed, mankind is in loss...**
>
> — _Q.S. Al-‘Asr (103): 1–2_
