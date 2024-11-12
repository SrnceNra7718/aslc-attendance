// /functions/attendanceUtils.ts
export const getMonthFromDate = (date: string): string => {
  // Extract the month part from date string "mm_dd_yyyy"
  const [month] = date.split("_");
  return month; // Return month as a string
};
