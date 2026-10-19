/**
 * Formats a date string into a clean, human-readable standard format (e.g. "Mar 8, 2024").
 * Strips raw ISO time components such as "T07:54:49Z".
 */
export function formatPracticeDate(dateStr?: string): string {
  if (!dateStr) return '';

  const dateOnlyMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateStr);
  if (dateOnlyMatch) {
    const [, year, month, day] = dateOnlyMatch;
    const date = new Date(Number(year), Number(month) - 1, Number(day));
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  }

  const parsed = new Date(dateStr);
  if (isNaN(parsed.getTime())) {
    // If it contains an ISO 'T', strip the time portion as a graceful fallback
    return dateStr.includes('T') ? dateStr.split('T')[0] : dateStr;
  }

  return parsed.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}
