import { describe, it, expect } from 'vitest';
import { stripCardSpaces } from '../utils/cardFormatting';

describe('stripCardSpaces', () => {
  it('removes spaces from card number', () => {
    expect(stripCardSpaces('1234 5678 1234 5678')).toBe('1234567812345678');
  });

  it('handles no spaces', () => {
    expect(stripCardSpaces('1234567812345678')).toBe('1234567812345678');
  });
});
