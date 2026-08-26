# Waktos

[![npm version](https://img.shields.io/npm/v/waktos.svg)](https://www.npmjs.com/package/waktos)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Downloads](https://img.shields.io/npm/dm/waktos.svg)](https://www.npmjs.com/package/waktos)

> ~4kB for the death of ugly dates!

Waktos is a small, immutable TypeScript library for instants, calendar arithmetic, IANA time zones, and `Intl`-based formatting. A value represents one moment in time; its locale and time zone determine its presentation and calendar behavior.

It is intended for application timestamps, display, ranges, and simple calendar logic. It is not a full scheduling or recurrence system; see [Limits and non-goals](#limits-and-non-goals).

## Install

```sh
npm i waktos
```

Waktos supports Node.js 20.19 or later and modern JavaScript runtimes with `Intl` time-zone support.

## Quick start

```ts
import Waktos from "waktos";

const departure = Waktos.from("2026-03-07T22:00:00Z")
  .locale("en-US")
  .zone("America/New_York");

departure.format("YYYY-MM-DD HH:mm Z"); // "2026-03-07 17:00 -05:00"

const tomorrow = departure.add({ day: 1 });
tomorrow.format("YYYY-MM-DD HH:mm Z"); // "2026-03-08 17:00 -04:00"

// All operations are immutable.
departure.format("YYYY-MM-DD HH:mm Z"); // "2026-03-07 17:00 -05:00"
```

> [!TIP]
> Use `Waktos.utc()` for deterministic output in tests, CI, logs, and timestamps exchanged between systems.

## Mental model: instant plus context

Each value stores:

- An epoch-millisecond timestamp (the instant).
- A BCP 47 locale used for localized operations.
- An IANA time zone used for display and calendar operations.

Changing locale or zone never changes the instant. It creates a new view of the same moment.

```ts
const instant = Waktos.utc("2026-01-01T10:00:00Z");

instant.zone("Asia/Kathmandu").format("HH:mm Z"); // "15:45 +05:45"
instant.zone("Pacific/Pago_Pago").format("HH:mm Z"); // "23:00 -11:00"
instant.toISOString(); // "2026-01-01T10:00:00.000Z"

instant.locale("id-ID").zone("Asia/Jakarta").context();
// { locale: "id-ID", zone: "Asia/Jakarta" }
```

## Creating values and parsing

```ts
Waktos.now();
Waktos.from(1_735_787_045_000);
Waktos.from(new Date("2025-01-02T03:04:05Z"));
Waktos.from("2025-01-02T03:04:05.123+07:00");

Waktos.local("2025-01-02T03:04:05Z"); // system locale and time zone
Waktos.utc("2025-01-02T03:04:05Z"); // UTC context
Waktos.zoned("2025-01-02T09:00", "America/New_York"); // named-zone wall time
```

Accepted strings are a strict ISO-like subset:

```txt
YYYY-MM-DD
YYYY-MM-DDTHH:mm
YYYY-MM-DDTHH:mm:ss
YYYY-MM-DDTHH:mm:ss.S, .SS, or .SSS
... with Z, +HH:mm, +HHmm, -HH:mm, or -HHmm
```

Leading/trailing whitespace is ignored. Invalid calendar dates, clock values, offsets, empty strings, non-finite numbers, invalid `Date` objects, and arbitrary objects are rejected. Use `Waktos.isValid(input)` to validate without throwing.

### Offsetless input is contextual

An offsetless date-time does not identify an instant by itself:

```ts
// Interprets this wall time in the machine's system time zone.
Waktos.from("2026-02-20T09:30:00");

// Interprets the same text as UTC.
Waktos.utc("2026-02-20T09:30:00");
```

The same applies to date-only input: `Waktos.from("2026-02-20")` is local midnight, while `Waktos.utc("2026-02-20")` is midnight UTC.

> [!IMPORTANT]
> Use an explicit `Z` or offset for timestamps exchanged between systems. An offsetless ISO string is inherently contextual.

> [!WARNING]
> Calling `.zone("America/New_York")` after parsing does **not** parse the input in New York. Use `Waktos.zoned()` for a wall-clock time in a named zone.

### Named-zone wall time and DST disambiguation

`Waktos.zoned(input, zone, disambiguation?)` creates an instant from an offsetless ISO-like wall time in an IANA zone. It rejects input with `Z` or an offset because that input already identifies an instant.

```ts
const meeting = Waktos.zoned("2026-03-08T09:00", "America/New_York");
meeting.toISOString(); // "2026-03-08T13:00:00.000Z"
```

At a DST transition, choose `"compatible"` (the default: earlier repeated occurrence and forward through a gap), `"earlier"`, `"later"`, or `"reject"`. The latter throws for repeated and nonexistent wall times.

> [!CAUTION]
> For bookings and recurring schedules, choose a disambiguation policy deliberately. `"reject"` is often safest when an ambiguous or nonexistent local time must be confirmed by a user.

```ts
Waktos.zoned("2026-11-01T01:30", "America/New_York", "earlier");
// 2026-11-01T05:30:00.000Z
Waktos.zoned("2026-11-01T01:30", "America/New_York", "later");
// 2026-11-01T06:30:00.000Z
```

## Time zones and locales

```ts
const value = Waktos.utc("2026-02-20T12:00:00Z");

value.zone("America/New_York"); // validates through Intl
value.utc(); // UTC view
value.local(); // system-zone view
value.locale("fr-FR"); // validates and normalizes through Intl
```

Waktos uses the runtime's IANA time-zone database and `Intl` locale data. This keeps the package small, but exact localized names and available zones depend on the JavaScript runtime.

> [!NOTE]
> Test target runtimes when exact localized wording, available zones, or locale week rules are business-critical.

## Arithmetic and differences

`add()` and `subtract()` accept singular or plural units:

```ts
const start = Waktos.utc("2026-01-31T10:00:00Z");

start.add({ month: 1 }).toISOString(); // "2026-02-28T10:00:00.000Z"
start.add({ days: 1, hours: 2, minutes: 30 });
start.subtract({ year: 1 });
```

Supported units are `millisecond`, `second`, `minute`, `hour`, `day`, `month`, and `year` (and their plural forms). Month/year moves clamp to the end of the target month; leap day plus one year becomes February 28.

- Milliseconds through hours are elapsed-time units.
- Days, months, and years are calendar units in the instance's time zone.

Therefore `add({ day: 1 })` aims to preserve the local clock over DST when possible, while `add({ hour: 24 })` advances exactly 24 elapsed hours. A local time landing in a spring-forward gap is normalized forward; a repeated fall-back time is resolved using the operation's surrounding time as context.

```ts
const ny = Waktos.utc("2026-03-07T22:00:00Z").zone("America/New_York");

ny.add({ day: 1 }).format("HH:mm Z"); // "17:00 -04:00"
ny.add({ hour: 24 }).format("HH:mm Z"); // "18:00 -04:00"
```

`diff()` takes the same units:

```ts
const earlier = Waktos.utc("2026-02-20T00:00:00Z");
const later = Waktos.utc("2026-02-20T01:30:00Z");

later.diff(earlier, "minute"); // 90
later.diff(earlier, "hour"); // 1.5
```

Differences from milliseconds through days are elapsed and may be fractional (`day` is exactly 24 hours). Month/year differences count completed calendar units in the receiver's zone.

## Comparison and conversion

Comparison is by instant, independent of display context:

```ts
const a = Waktos.utc("2026-02-20T00:00:00Z");
const b = Waktos.utc("2026-02-21T00:00:00Z");

a.isBefore(b); // true
b.isAfter(a); // true
a.isSame(Waktos.from(a)); // true
```

```ts
const value = Waktos.utc("2005-04-26T03:04:05.006Z");

value.valueOf(); // epoch milliseconds
value.toDate(); // a new native Date
value.toISOString(); // always UTC
value.toJSON(); // same as toISOString()
value.toString(); // context-aware ISO-like string with numeric offset
```

## Formatting

`format()` requires a non-empty pattern. Square brackets emit literals.

```ts
const value = Waktos.utc("2005-04-26T15:04:05.006Z");

value.format("YYYY-MM-DD HH:mm:ss.SSS Z");
// "2005-04-26 15:04:05.006 +00:00"

value.format("[generated at] X");
// "generated at 1114527845"
```

| Token                       | Meaning                            |
| --------------------------- | ---------------------------------- |
| `YYYY`, `YY`                | Year                               |
| `Q`                         | Quarter (1–4)                      |
| `MM`, `M`                   | Month                              |
| `DD`, `D`                   | Day of month                       |
| `HH`, `H`                   | 24-hour clock                      |
| `hh`, `h`                   | 12-hour clock                      |
| `mm`, `m`, `ss`, `s`, `SSS` | Minute, second, millisecond        |
| `Z`, `ZZ`                   | Numeric offset (`+07:00`, `+0700`) |
| `X`, `x`                    | Unix seconds, epoch milliseconds   |
| `[text]`                    | Literal text                       |

Core numeric tokens always use Latin digits. Localized names and day periods require the localized-token plugin.

## Plugins

Plugins are opt-in global extensions of the `Waktos` class. Import the plugins an application needs, then install them with `Waktos.extend()`. Reinstalling the same plugin is safe.

```ts
import Waktos from "waktos";
import boundary from "waktos/plugin/boundary";
import range from "waktos/plugin/range";

Waktos.extend([boundary, range]);
```

| Plugin           | Import                          | Adds                                          |
| ---------------- | ------------------------------- | --------------------------------------------- |
| Boundary         | `waktos/plugin/boundary`        | `startOf(unit)`, `endOf(unit)`                |
| Range            | `waktos/plugin/range`           | `clamp()`, `isBetween()`, `overlaps()`        |
| Relative time    | `waktos/plugin/relativeTime`    | `from()`, `fromNow()`                         |
| Week             | `waktos/plugin/week`            | `startOfWeek()`, `endOfWeek()`, `isWeekend()` |
| Localized tokens | `waktos/plugin/localizedTokens` | Localized formatting tokens                   |
| Ordinal format   | `waktos/plugin/ordinalFormat`   | Caller-defined ordinal tokens                 |

### Boundaries and ranges

Boundary calculations use the instance's calendar zone and preserve its locale/zone. Range comparisons use instants. `isBetween()` and `overlaps()` are inclusive by default and accept `"[]"`, `"[)"`, `"(]"`, or `"()"`.

```ts
Waktos.extend([boundary, range]);

const value = Waktos.utc("2026-02-20T12:00:00Z");
value.startOf("month").toISOString(); // "2026-02-01T00:00:00.000Z"
value.isBetween("2026-02-20T00:00:00Z", "2026-02-21T00:00:00Z"); // true
```

### Localized tokens and ordinals

```ts
import localizedTokens from "waktos/plugin/localizedTokens";
import ordinalFormat from "waktos/plugin/ordinalFormat";

Waktos.extend([localizedTokens, ordinalFormat]);
Waktos.ordinal("en-US", (value) => `${value}th`);

const value = Waktos.utc("2026-04-26T15:04:05Z").locale("en-US");
value.format("dddd, MMMM Do h:mm A z");
```

Localized tokens are `MMMM`, `MMM`, `dddd`, `ddd`, `A`, `a`, `B`, `b`, `z`, and `zz`; their text is supplied by `Intl`. Ordinals apply to numeric tokens followed by `o`, such as `Do` and `Mo`.

Relative time uses `Intl.RelativeTimeFormat` with `numeric: "auto"`. The week plugin uses `Intl.Locale.weekInfo` when available; its fallback is Monday-first with Saturday/Sunday weekends.

## TypeScript

Types are bundled:

```ts
import Waktos, {
  type DateInput,
  type Disambiguation,
  type Duration,
  type Unit
} from "waktos";

function postpone(input: DateInput, duration: Duration): Waktos {
  return Waktos.from(input).add(duration);
}

const unit: Unit = "days";
const policy: Disambiguation = "reject";
```

## Limits and non-goals

Waktos is deliberately small. Keep these constraints in mind:

- `Waktos.zoned()` accepts strict offsetless ISO-like wall times and resolves DST ambiguity explicitly, but it does not support custom-format or natural-language parsing.
- It has no setters, recurrence rules, business calendars, or holiday calculations.
- `Waktos.zoned()` disambiguates one wall time; recurring schedules still need a dedicated recurrence model.
- Zone names, localized text, available zones, and locale week data come from runtime `Intl`. Test target runtimes where exact output or week rules matter.
- String parsing is intentionally narrow: four-digit years, ISO-like dates, and millisecond precision.

For ordinary user-facing timestamps and date manipulation this is a predictable, lightweight contract. For high-stakes scheduling, payroll, compliance, or historical-calendar work, use an API that models zoned civil time and ambiguity explicitly.

## Compatibility

- Node.js: 20.19+
- Browsers: Chrome, Firefox, and Edge 84+; Safari 14.1+; iOS 14.5+; Samsung Internet 14+
- Module formats: ESM and CommonJS

> [!NOTE]
> Time-zone names, localized text, and locale week rules depend on the runtime's `Intl`/ICU data. The week plugin falls back to Monday-first weeks with Saturday/Sunday weekends when locale week information is unavailable.

## Development

```sh
pnpm install --frozen-lockfile
pnpm exec tsc --noEmit
pnpm exec eslint src tests --max-warnings=0
pnpm test
pnpm build
```

## License

[MIT](LICENSE)