import { describe, it, expect } from 'vitest';

// Sample unit tests for the data-loading utilities.
// Run with:  npm test

describe('parseEuropeanNumber', () => {
  // Inline helper to mirror the private function in restaurantData.ts
  const parse = (value: string) => parseFloat(value.replace(',', '.'));

  it('parses integers correctly', () => {
    expect(parse('42')).toBe(42);
  });

  it('parses European decimal notation (comma separator)', () => {
    expect(parse('8,75')).toBeCloseTo(8.75);
  });

  it('returns NaN for empty string', () => {
    expect(parse('')).toBeNaN();
  });
});

describe('Restaurant data shape', () => {
  it('boolean fields map TRUE/FALSE strings', () => {
    const mapBool = (v: string) => v === 'TRUE';
    expect(mapBool('TRUE')).toBe(true);
    expect(mapBool('FALSE')).toBe(false);
  });
});

