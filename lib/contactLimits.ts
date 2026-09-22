/** Shared by the contact form (browser) and /api/contact (server). */
export const CONTACT_LIMITS = {
  name: 120,
  email: 254,
  phone: 80,
  choice: 60,
  message: 5000,
} as const;

/**
 * Email check. Rejects common typos that email services refuse, such as
 * "jane@gmail..com", a trailing dot, or a comma instead of a dot.
 */
export const EMAIL_PATTERN =
  /^[^\s@,;<>"()]+@(?:[A-Za-z0-9-]+\.)+[A-Za-z]{2,}$/;
