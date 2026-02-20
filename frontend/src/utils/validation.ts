export const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
export const EXPIRY_DATE_REGEX = /^(0[1-9]|1[0-2])\/\d{2}$/;
export const CVV_REGEX = /^\d{3}$/;

export function validateExpiryDate(value: string): string | true {
  // Strip mask placeholder chars
  const cleaned = value.replace(/[_\s]/g, '');
  if (!EXPIRY_DATE_REGEX.test(cleaned)) {
    return 'Use MM/YY format (e.g. 03/26)';
  }
  const [month, year] = cleaned.split('/').map(Number);
  if (month < 1 || month > 12) {
    return 'Invalid month';
  }
  const now = new Date();
  const expiryDate = new Date(2000 + year, month);
  if (expiryDate <= now) {
    return 'Card has expired';
  }
  return true;
}

export function validateCardNumber(value: string): string | true {
  const digits = value.replace(/[\s_]/g, '');
  if (!/^\d{16}$/.test(digits)) {
    return 'Card number must be exactly 16 digits';
  }
  return true;
}
