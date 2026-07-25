/**
 * The backend serializes null/empty DB values as `{}` instead of `null` or `""`.
 * A plain `value || fallback` treats `{}` as truthy, so it leaks through as an
 * object into UI state. These helpers coerce by actual runtime type instead.
 */
export const asText = (value: unknown, fallback = ''): string =>
  typeof value === 'string' ? value : fallback;

export const asNumber = (value: unknown, fallback = 0): number =>
  typeof value === 'number' ? value : fallback;
