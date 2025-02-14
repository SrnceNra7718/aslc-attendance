// ReportsToDownload.tsx

import { MonthlyAttendance } from "../../types/attendanceTypes";
import {
  calculateAverage,
  calculateDeafAverage,
} from "../../functions/attendanceUtils";

interface ReportsToDownloadProps {
  filteredData: MonthlyAttendance[];
  selectedRange: string;
}

interface AttendanceMonthlyReport {
  month: string;
  year: number;
  midWeek: {
    count: number;
    total: number;
    average: number;
    deafTotal: number;
    deafAverage: number;
  };
  weekend: {
    count: number;
    total: number;
    average: number;
    deafTotal: number;
    deafAverage: number;
  };
}

// Function to calculate average attendance for weekends or midweeks
export const calculateAverageAttendanceEachMonth = (
  data: MonthlyAttendance[],
  type: "weekend" | "midWeek",
): number => {
  const totalAverage = data.reduce((sum, month) => {
    const records = month[type];
    const monthlyAverage =
      records.reduce((total, record) => total + (record.total || 0), 0) /
      (records.length || 1);
    return sum + monthlyAverage;
  }, 0);

  const count = data.length;
  return count > 0 ? totalAverage / count : 0;
};

export const processAttendanceReports = ({
  filteredData,
  selectedRange,
}: ReportsToDownloadProps): AttendanceMonthlyReport[] => {
  // Generate attendance reports
  const reports: AttendanceMonthlyReport[] = filteredData.map((monthly) => {
    const midWeekCount = monthly.midWeek.length;
    const weekendCount = monthly.weekend.length;

    const midWeekTotal = monthly.midWeek.reduce(
      (sum, entry) => sum + entry.total,
      0,
    );
    const weekendTotal = monthly.weekend.reduce(
      (sum, entry) => sum + entry.total,
      0,
    );

    const midWeekDeafTotal = monthly.midWeek.reduce(
      (sum, entry) => sum + entry.deaf,
      0,
    );
    const weekendDeafTotal = monthly.weekend.reduce(
      (sum, entry) => sum + entry.deaf,
      0,
    );

    return {
      month: monthly.month,
      year: monthly.year,
      midWeek: {
        count: midWeekCount,
        total: midWeekTotal,
        average: calculateAverage(midWeekCount, midWeekTotal),
        deafTotal: midWeekDeafTotal,
        deafAverage: calculateDeafAverage(midWeekCount, midWeekDeafTotal),
      },
      weekend: {
        count: weekendCount,
        total: weekendTotal,
        average: calculateAverage(weekendCount, weekendTotal),
        deafTotal: weekendDeafTotal,
        deafAverage: calculateDeafAverage(weekendCount, weekendDeafTotal),
      },
    };
  });

  return reports; // Return the processed reports data instead of a workbook
};
