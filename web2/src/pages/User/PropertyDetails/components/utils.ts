/**
 * Helper to humanize house rules into friendly sentences
 */
export const humanizeRule = (label: string, value: boolean | string | null | undefined): string => {
  if (value === 'Allowed' || value === true) {
    if (label.toLowerCase().includes('pets')) return 'Pets are welcome to stay with you';
    if (label.toLowerCase().includes('smoking')) return 'Smoking is permitted in designated areas';
    if (label.toLowerCase().includes('children')) return 'Children of all ages are welcome';
    if (label.toLowerCase().includes('parties')) return 'Events and parties can be hosted here';
    return `${label} is permitted`;
  }
  if (value === 'Not Allowed' || value === false) {
    return `${label} is not allowed to ensure guest comfort`;
  }
  if (label.toLowerCase().includes('fees') && value && value !== '—') {
    return `Pet policy: ${value}`;
  }
  return typeof value === 'string' ? (value || '—') : '—';
};
