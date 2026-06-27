export const getSriLankaTime = (date?: Date | string | number): Date => {
  const d = date ? new Date(date) : new Date();
  
  // Convert absolute time to Sri Lanka local time (UTC+5:30)
  // By shifting the UTC time, when Prisma saves this to Supabase, 
  // it forces the UTC timestamp to match Sri Lanka local time.
  const sriLankaOffset = 5.5 * 60 * 60 * 1000; // +5:30
  
  // However, `d.getTime()` is absolute. If we simply add the offset,
  // we shift the point in time forward.
  // Since Prisma sends dates to Postgres as UTC, the saved UTC time
  // will visually match Sri Lanka local time.
  return new Date(d.getTime() + sriLankaOffset);
};
