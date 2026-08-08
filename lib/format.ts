/**
 * Display formatting helpers. Used for output only - every value sent to the
 * server is the raw number or ISO string, never a formatted string.
 */

/**
 * Dream Home is the Connolly & Begg UK case study, so salaries and rents are
 * shown in pounds. Change these two constants to relocate the demo.
 */
export const LOCALE = "en-GB";
export const CURRENCY = "GBP";

const currencyFormatter = new Intl.NumberFormat(LOCALE, {
  style: "currency",
  currency: CURRENCY,
  maximumFractionDigits: 0,
});

const dateFormatter = new Intl.DateTimeFormat(LOCALE, {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

export function formatCurrency(value: number | null | undefined): string {
  if (value === null || value === undefined || Number.isNaN(value)) return "-";
  return currencyFormatter.format(value);
}

/** yyyy-mm-dd -> 05 Aug 2026. Parsed as local time to avoid a day shift. */
export function formatDate(isoDate: string | null | undefined): string {
  if (!isoDate) return "-";
  const parsed = new Date(`${isoDate.slice(0, 10)}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) return isoDate;
  return dateFormatter.format(parsed);
}

export function formatDateTime(iso: string): string {
  const parsed = new Date(iso);
  if (Number.isNaN(parsed.getTime())) return iso;
  return parsed.toLocaleTimeString(LOCALE, { hour: "2-digit", minute: "2-digit" });
}

export function fullName(first: string, last: string): string {
  return `${first} ${last}`.trim();
}

/** Joins the parts of an address, skipping anything blank. */
export function formatAddress(...parts: (string | null | undefined)[]): string {
  return parts.map((part) => part?.trim()).filter(Boolean).join(", ");
}
