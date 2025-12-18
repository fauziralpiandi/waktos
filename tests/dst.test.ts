import { describe, expect, test } from 'vitest';
import waktos from 'waktos';

describe('DST Handling (Daylight Saving Time)', () => {
  // DST Start (Spring Forward): Sunday, March 12, 2023, 2:00:00 AM clocks were turned forward 1 hour to 3:00:00 AM
  // Timezone: America/New_York
  describe('Spring Forward (America/New_York)', () => {
    test('handles the moment before transition', () => {
      // 1:59 AM EST
      const date = waktos('2023-03-12T01:59:00', {
        timezone: 'America/New_York',
      });

      expect(date.hour()).toBe(1);
      expect(date.minute()).toBe(59);
      expect(date.format('Z')).toBe('-05:00'); // Standard Time
    });

    test('handles the jump (2:30 AM does not exist, should normalize or clamp)', () => {
      // If we try to set time to "invalid" DST gap, behavior depends on implementation.
      // Usually libraries jump to 3:30 or 1:30. Let's see how waktos handles strict parsing logic or arithmetic.

      // Let's test arithmetic: 1:00 AM + 2 hours = 3:00 AM (effectively 4:00 AM wall clock? No, 1AM + 1h = 2AM->3AM)
      // Wait, 1:59 AM + 1 minute = 3:00 AM EDT
      const before = waktos('2023-03-12T01:59:00', {
        timezone: 'America/New_York',
      });
      const after = before.add(1, 'minute');

      expect(after.hour()).toBe(3);
      expect(after.minute()).toBe(0);
      expect(after.format('Z')).toBe('-04:00'); // Daylight Time
    });
  });

  // DST End (Fall Back): Sunday, November 5, 2023, 2:00:00 AM clocks were turned backward 1 hour to 1:00:00 AM
  describe('Fall Back (America/New_York)', () => {
    test('handles arithmetic across the fallback (1:30 AM EDT -> 1:30 AM EST)', () => {
      // 12:30 AM EDT (before switch)
      // + 1 hour should be 1:30 AM EDT (still before switch)
      // + 2 hours should be 1:30 AM EST (after switch)

      // 2023-11-05 00:30 EDT is UTC-4
      const start = waktos('2023-11-05T00:30:00', {
        timezone: 'America/New_York',
      });

      expect(start.hour()).toBe(0);
      expect(start.format('Z')).toBe('-04:00');

      // Add 1 hour -> 01:30 EDT
      const plusOne = start.add(1, 'hour');

      expect(plusOne.hour()).toBe(1);
      expect(plusOne.format('Z')).toBe('-04:00');

      // Add 2 hours -> 01:30 EST (Clock repeats 1AM!)
      const plusTwo = start.add(2, 'hour');

      expect(plusTwo.hour()).toBe(1); // Still 1 AM, but now EST
      expect(plusTwo.format('Z')).toBe('-05:00');
    });
  });
});
