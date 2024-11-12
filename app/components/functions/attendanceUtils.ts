// /functions/attendanceUtils.ts
export const getMonthAndYearFromDate = (date: string): string => {
  // Extract month and year parts from date string "mm_dd_yyyy"
  const [month, , year] = date.split("_");

  // Convert month number (as string) to month name
  const monthName = (() => {
    switch (month) {
      case "01":
        return "January";
      case "02":
        return "February";
      case "03":
        return "March";
      case "04":
        return "April";
      case "05":
        return "May";
      case "06":
        return "June";
      case "07":
        return "July";
      case "08":
        return "August";
      case "09":
        return "September";
      case "10":
        return "October";
      case "11":
        return "November";
      case "12":
        return "December";
      default:
        return "Unknown"; // Handle unexpected values
    }
  })();

  return `${monthName} ${year}`; // Return formatted month and year
};
