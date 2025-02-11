// ReportsToDownload.tsx
import * as XLSX from "xlsx";
import { MonthlyAttendance } from "../../types/attendanceTypes";
import {
  calculateAverage,
  calculateDeafAverage,
} from "../../functions/attendanceUtils";

interface ReportsToDownloadProps {
  filteredData: MonthlyAttendance[];
  workbook: XLSX.WorkBook;
  selectedRange: string;
}

export const processAttendanceReports = ({
  filteredData,
  workbook,
}: ReportsToDownloadProps): XLSX.WorkBook => {
  // Generate attendance reports
  const reports = filteredData.map((monthly) => {
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

  // Format data for Excel
  const formattedData = reports.flatMap((report) => [
    {
      Month: report.month,
      "Meeting Type": "Midweek",
      "Meeting count": report.midWeek.count,
      Overall: report.midWeek.total,
      "Overall average": report.midWeek.average,
      "Deaf Total": report.midWeek.deafTotal,
      "Deaf Average": report.midWeek.deafAverage,
    },
    {
      Month: report.month,
      "Meeting Type": "Weekend",
      "Meeting count": report.weekend.count,
      Overall: report.weekend.total,
      "Overall average": report.weekend.average,
      "Deaf Total": report.weekend.deafTotal,
      "Deaf Average": report.weekend.deafAverage,
    },
  ]);

  // Add reports worksheet
  const reportSheet = XLSX.utils.json_to_sheet(formattedData);
  XLSX.utils.book_append_sheet(workbook, reportSheet, `Reports`);

  return workbook;
};
