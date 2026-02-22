export const formatPhoneNumber = (
  phoneNumberString: string | number,
): string => {
  if (!phoneNumberString) return "";

  // 1. Remove all non-numeric characters
  const cleaned = phoneNumberString.toString().replace(/\D/g, "");

  // 2. Extract the last 10 digits (ignores leading country codes like 8 or 7 if present)
  const last10Digits = cleaned.slice(-10);

  // 3. Check if we actually have 10 digits to format
  const match = last10Digits.match(/^(\d{3})(\d{3})(\d{2})(\d{2})$/);

  if (match) {
    // match[1] = 999, match[2] = 999, match[3] = 99, match[4] = 99
    return `+7 ${match[1]} ${match[2]} ${match[3]}-${match[4]}`;
  }

  // Fallback: return the original string if it doesn't contain enough digits
  return phoneNumberString.toString();
};
