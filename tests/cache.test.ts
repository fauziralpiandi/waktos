import { describe, expect, test, vi } from 'vitest';
import { Cache } from '../src/cache';
import waktos from 'waktos';

describe('Caching System', () => {
  describe('LRU Cache Implementation', () => {
    test('Should cache and retrieve values', () => {
      const cache = new Cache<string, number>(3);

      cache.set('a', 1);
      cache.set('b', 2);

      expect(cache.get('a')).toBe(1);
      expect(cache.get('b')).toBe(2);
      expect(cache.get('c')).toBeUndefined();
    });

    test('Should enforce max size (eviction)', () => {
      const cache = new Cache<string, number>(2);

      cache.set('a', 1);
      cache.set('b', 2);
      cache.set('c', 3); // Should evict 'a' (LRU)

      expect(cache.get('a')).toBeUndefined();
      expect(cache.get('b')).toBe(2);
      expect(cache.get('c')).toBe(3);
    });

    test('Should update LRU order on access (get)', () => {
      const cache = new Cache<string, number>(2);

      cache.set('a', 1);
      cache.set('b', 2);

      cache.get('a'); // 'a' becomes most recently used, 'b' becomes LRU
      cache.set('c', 3); // Should evict 'b'

      expect(cache.get('b')).toBeUndefined();
      expect(cache.get('a')).toBe(1);
      expect(cache.get('c')).toBe(3);
    });

    test('Should update LRU order on update (set)', () => {
      const cache = new Cache<string, number>(2);

      cache.set('a', 1);
      cache.set('b', 2);
      cache.set('a', 10); // 'a' updated and becomes MRU, 'b' is LRU
      cache.set('c', 3); // Should evict 'b'

      expect(cache.get('b')).toBeUndefined();
      expect(cache.get('a')).toBe(10);
      expect(cache.get('c')).toBe(3);
    });
  });

  describe('Integration: Formatter Cache', () => {
    test('Should reuse Intl.DateTimeFormat instances', () => {
      const spy = vi.spyOn(Intl, 'DateTimeFormat');
      const ts = 1703505600000;
      const options = { locale: 'en-US', timezone: 'UTC' };

      // First call: Should create new formatter
      waktos(ts, options).format();
      // Second call: Should reuse cached formatter
      waktos(ts + 1000, options).format();
      waktos(ts + 2000, options).format();

      // Check how many times the constructor was called with these exact args
      // Note: Internal logic might create formatters for other purposes (like parsing parts),
      // so we check if call count is significantly lower than operation count.

      // We expect at least 1 call. If it was called 3 times, cache is broken.
      // However, `waktos()` creation triggers `parseTimezoneComponents` which triggers `createDateFormatter`.
      // .format() also triggers it.

      // Let's count unique calls.
      const calls = spy.mock.calls.filter(
        args => args[0] === 'en-US' && (args[1] as any)?.timeZone === 'UTC',
      );

      // Depending on implementation details (e.g. fallback logic), it might be called once or twice initially,
      // but subsequent calls shouldn't increase it linearly.

      // Clean up
      spy.mockRestore();

      // If caching works, 3 operations shouldn't mean 3 constructions (usually 1).
      expect(calls.length).toBeLessThan(3);
    });
  });
});
