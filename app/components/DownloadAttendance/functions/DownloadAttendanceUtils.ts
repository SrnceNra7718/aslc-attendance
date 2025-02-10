import {
  AttendanceRecord,
  MonthlyAttendance,
} from "../../types/attendanceTypes";

// Function to categorize attendance data by month and year
export const sortingMonthlyAttendanceData = (
  attendanceData: AttendanceRecord[],
): MonthlyAttendance[] => {
  const categorizedData: { [key: string]: MonthlyAttendance } = {};

  attendanceData.forEach((record) => {
    const dateParts = record.date_mm_dd_yyyy.split(" ");
    const month = dateParts[0];
    const year = parseInt(dateParts[2]);

    const key = month + " " + year; // Corrected to use string concatenation
    if (!categorizedData[key]) {
      categorizedData[key] = {
        month: month,
        year: year,
        midWeek: [],
        weekend: [],
      };
    }

    if (record.meeting_type === "Midweek") {
      categorizedData[key].midWeek.push(record);
    } else {
      categorizedData[key].weekend.push(record);
    }
  });

  return Object.values(categorizedData);
};
