/**
 * Returns a Date object shifted to Sri Lankan time (UTC+5:30).
 * This is used to ensure consistency between the frontend and backend 
 * regardless of the user's local browser timezone.
 */
export const getSriLankaTime = (date?: Date | string | number): Date => {
  const d = date ? new Date(date) : new Date();
  
  // 1. Get current UTC time in milliseconds
  const utc = d.getTime() + (d.getTimezoneOffset() * 60000);
  
  // 2. Apply Sri Lanka offset (+5:30)
  const sriLankaOffset = 5.5 * 60 * 60 * 1000;
  
  return new Date(utc + sriLankaOffset);
};
