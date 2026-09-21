import { describe, it, expect } from 'vitest';
import { fmt, fmtShort, fmtDuration, fmtDurationHuman } from './format';

describe('fmt', () => {
  it('formats IDR currency with the amount digits', () => {
    const out = fmt(1500000);
    expect(out).toContain('1.500.000');
  });
});

describe('fmtShort', () => {
  it('abbreviates millions and thousands', () => {
    expect(fmtShort(2500000)).toBe('3jt'); // default no decimal -> rounds
    expect(fmtShort(2500000, true)).toBe('2.5jt');
    expect(fmtShort(15000)).toBe('15rb');
    expect(fmtShort(500)).toBe('500');
  });
});

describe('fmtDuration', () => {
  it('formats mm:ss and h:mm:ss', () => {
    expect(fmtDuration(65)).toBe('01:05');
    expect(fmtDuration(3661)).toBe('1:01:01');
    expect(fmtDuration(-5)).toBe('00:00');
  });
});

describe('fmtDurationHuman', () => {
  it('formats hours and minutes in Indonesian shorthand', () => {
    expect(fmtDurationHuman(3600)).toBe('1j');
    expect(fmtDurationHuman(5400)).toBe('1j 30m');
    expect(fmtDurationHuman(1800)).toBe('30m');
  });
});
