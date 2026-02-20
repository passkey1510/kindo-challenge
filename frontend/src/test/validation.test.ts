import { describe, it, expect } from 'vitest';
import { validateCardNumber, validateExpiryDate } from '../utils/validation';

describe('validateCardNumber', () => {
  it('accepts valid 16-digit card number', () => {
    expect(validateCardNumber('1234567812345678')).toBe(true);
  });

  it('accepts card number with spaces', () => {
    expect(validateCardNumber('1234 5678 1234 5678')).toBe(true);
  });

  it('rejects too short', () => {
    expect(validateCardNumber('12345')).toBe('Card number must be exactly 16 digits');
  });

  it('rejects too long', () => {
    expect(validateCardNumber('12345678123456789')).toBe('Card number must be exactly 16 digits');
  });

  it('rejects non-numeric', () => {
    expect(validateCardNumber('1234abcd12345678')).toBe('Card number must be exactly 16 digits');
  });

  it('rejects incomplete mask', () => {
    expect(validateCardNumber('1234 5678 ____ ____')).toBe('Card number must be exactly 16 digits');
  });
});

describe('validateExpiryDate', () => {
  it('accepts valid future date', () => {
    expect(validateExpiryDate('12/30')).toBe(true);
  });

  it('rejects expired date', () => {
    expect(validateExpiryDate('01/20')).toBe('Card has expired');
  });

  it('rejects invalid format', () => {
    expect(validateExpiryDate('1/26')).toBe('Use MM/YY format (e.g. 03/26)');
    expect(validateExpiryDate('13/26')).toBe('Use MM/YY format (e.g. 03/26)');
    expect(validateExpiryDate('00/26')).toBe('Use MM/YY format (e.g. 03/26)');
    expect(validateExpiryDate('abcd')).toBe('Use MM/YY format (e.g. 03/26)');
  });

  it('rejects incomplete mask', () => {
    expect(validateExpiryDate('__/__')).toBe('Use MM/YY format (e.g. 03/26)');
    expect(validateExpiryDate('12/__')).toBe('Use MM/YY format (e.g. 03/26)');
  });
});
