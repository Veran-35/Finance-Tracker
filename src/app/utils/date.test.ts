import { describe, it, expect } from 'vitest';
import {
  daysUntil,
  currentMonthPrefix,
  shiftMonthPrefix,
  monthLabel,
} from './date';

describe('shiftMonthPrefix', () => {
  it('moves forward and backward across year boundaries', () => {
    expect(shiftMonthPrefix('2026-01', -1)).toBe('2025-12');
    expect(shiftMonthPrefix('2025-12', 1)).toBe('2026-01');
    expect(shiftMonthPrefix('2026-09', -1)).toBe('2026-08');
    expect(shiftMonthPrefix('2026-09', 3)).toBe('2026-12');
  });
});

describe('monthLabel', () => {
  it('formats an Indonesian month name and year', () => {
    expect(monthLabel('2026-09')).toBe('September 2026');
    expect(monthLabel('2026-01')).toBe('Januari 2026');
  });
});

describe('currentMonthPrefix', () => {
  it('matches the local year and month', () => {
    const now = new Date();
    const expected = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    expect(currentMonthPrefix()).toBe(expected);
  });
});

describe('daysUntil', () => {
  it('returns 0 for today and positive for a future local date', () => {
    const now = new Date();
    const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    expect(daysUntil(today)).toBe(0);

    const plus3 = new Date(now);
    plus3.setDate(now.getDate() + 3);
    const plus3Str = `${plus3.getFullYear()}-${String(plus3.getMonth() + 1).padStart(2, '0')}-${String(plus3.getDate()).padStart(2, '0')}`;
    expect(daysUntil(plus3Str)).toBe(3);
  });
});
