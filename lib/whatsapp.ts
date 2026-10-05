/**
 * Link that opens a WhatsApp chat with `number` (wa.me format: country code
 * and number, digits only, e.g. "23055310734") and `message` pre-filled.
 * Numbers live in data/site.ts (WHATSAPP_NUMBERS).
 */
export function whatsappUrl(number: string, message: string): string {
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}
