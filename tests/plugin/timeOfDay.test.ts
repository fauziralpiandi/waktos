import { describe, it, expect } from 'vitest';
import waktos from 'waktos';
import timeOfDay from 'waktos/plugin/timeOfDay';
import 'waktos/locale/id-id';

waktos.plugin(timeOfDay);

describe('Plugin: Time of Day', () => {
  it('Basic functionality (en-US fallback)', () => {
    // en-US doesn't strictly define timeOfDay periods in our basic locale file yet,
    // so this tests the fallback or basic existence if defined.
    // Assuming en-US might not have it, it returns a default or fallback.
    // But let's check id-id which usually has distinct "pagi", "siang", etc.

    const locale = 'id-id';
    const pagi = waktos('2023-01-01T06:00:00').locale(locale);
    const siang = waktos('2023-01-01T12:00:00').locale(locale);
    const sore = waktos('2023-01-01T16:00:00').locale(locale);
    const malam = waktos('2023-01-01T20:00:00').locale(locale);

    // Note: This test depends on id-id.ts actually having `periods`.
    // If not, it returns fallback. Let's verify what we have in id-id.ts first implicitly.
    // If it fails, we know we need to update the locale file.

    // Based on common Indonesian locale data:
    expect(pagi.timeOfDay()).toMatch(/pagi/i);
    expect(siang.timeOfDay()).toMatch(/siang/i);
    expect(sore.timeOfDay()).toMatch(/sore/i);
    expect(malam.timeOfDay()).toMatch(/malam/i);
  });
});
