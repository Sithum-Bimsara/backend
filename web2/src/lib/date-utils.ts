/**
 * Returns a date string in the local timezone (YYYY-MM-DD).
 * This avoids the common timezone shift issue when using toISOString().
 */
export const getLocalDateStr = (d: Date | string | number | null | undefined): string => {
  if (!d) return '';
  const date = new Date(d);
  if (isNaN(date.getTime())) return '';
  
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}`;
};

/**
 * Formats a date string into a more readable format using local settings (e.g. "Mar 30, 2026").
 */
export const formatLocalDate = (d: Date | string | number | null | undefined, options?: Intl.DateTimeFormatOptions): string => {
  if (!d) return '';
  const date = new Date(d);
  if (isNaN(date.getTime())) return '';
  return date.toLocaleDateString('en-US', {
    ...options,
    month: options?.month || 'short',
    day: options?.day || 'numeric',
    year: options?.year || 'numeric'
  });
};

/**
 * Formats a time string into a local readable format (e.g. "09:30 AM").
 */
export const formatLocalTime = (d: Date | string | number | null | undefined): string => {
  if (!d) return '';
  const date = new Date(d);
  if (isNaN(date.getTime())) return '';
  
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  });
};

/**
 * Formats a time string using UTC components to avoid timezone shifts (e.g. "09:00 AM").
 * Use this when you want to show the exact time stored in the database regardless of the user's location.
 */
export const formatLiteralTime = (d: Date | string | number | null | undefined): string => {
  if (!d) return '';
  const date = new Date(d);
  if (isNaN(date.getTime())) return '';

  const hours = date.getUTCHours();
  const minutes = date.getUTCMinutes();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12;
  const displayMinutes = String(minutes).padStart(2, '0');

  return `${String(displayHours).padStart(2, '0')}:${displayMinutes} ${ampm}`;
};

/**
 * Returns a string formatted for <input type="datetime-local"> (YYYY-MM-DDTHH:mm)
 * using the local timezone.
 */
export const formatDateTimeLocal = (d: Date | string | number | null | undefined): string => {
  if (!d) return '';
  const date = new Date(d);
  if (isNaN(date.getTime())) return '';
  
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  
  return `${year}-${month}-${day}T${hours}:${minutes}`;
};
