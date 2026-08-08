// VN mobile number — 10 digits starting with 0 and a valid carrier prefix (3/5/7/8/9),
// or the international +84 form (drops the leading 0).
export const VN_PHONE_REGEX = /^(?:\+84|0)(?:3|5|7|8|9)\d{8}$/;

/** Rewrites a VN mobile number to its E.164 form. */
export const normalizeVnPhone = (phone: string): string =>
  phone.startsWith('0') ? `+84${phone.slice(1)}` : phone;
