// /functions/attendanceUtils.ts
export const getMonthAndYearFromDate = (date: string | undefined): string => {
  if (!date) {
    console.warn("Invalid date input:", date);
    return "Unknown Date";
  }

  const parts = date.split("_");
  if (parts.length !== 3) {
    console.warn("Date format mismatch:", date);
    return "Unknown Date";
  }

  const [month, , year] = parts;

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
        console.warn("Unexpected month value:", month);
        return "Unknown Month";
    }
  })();

  return `${monthName} ${year}`;
};
