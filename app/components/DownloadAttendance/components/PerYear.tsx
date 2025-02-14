// Updated PerYear.tsx
import React, { useState } from "react";
import { MonthlyAttendance } from "../../types/attendanceTypes";
import { fetchLatestAttendance } from "@/utils/supabase/database";
import { sortingMonthlyAttendanceData } from "../functions/DownloadAttendanceUtils";
import { Autocomplete, AutocompleteItem, Button } from "@nextui-org/react";
import XLSX, { ExcelDataType } from "xlsx-js-style"; // Use xlsx-js-style for styling support

import {
  processAttendanceReports,
  calculateAverageAttendanceEachMonth,
} from "../functions/ReportsToDownload";

interface PerYearProps {
  months: string[];
  years: string[];
}

// Define a single style object for easier maintenance
export const cellStyle = {
  font: { bold: true },
  border: {
    top: { style: "thin" },
    bottom: { style: "thin" },
    left: { style: "thin" },
    right: { style: "thin" },
  },
};
export const BorderStyle = {
  border: {
    top: { style: "thin" },
    bottom: { style: "thin" },
    left: { style: "thin" },
    right: { style: "thin" },
  },
};

export const PerYear: React.FC<PerYearProps> = ({ months, years }) => {
  // Per Year
  const [selectedYear, setSelectedYear] = useState<string | null>(null);

  const arrangeDataByMonth = (
    data: MonthlyAttendance[],
  ): MonthlyAttendance[] => {
    const monthOrder = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];
    return data.sort(
      (a, b) => monthOrder.indexOf(a.month) - monthOrder.indexOf(b.month),
    );
  };

  const handleYearlyDownloadButtonClick = async (): Promise<void> => {
    if (!selectedYear) {
      alert("Please select a year");
      return;
    }

    // Fetch the latest attendance data
    const latestAttendance = await fetchLatestAttendance();

    // Sort and categorize the attendance data
    const categorizedData: MonthlyAttendance[] =
      sortingMonthlyAttendanceData(latestAttendance);

    const year = parseInt(selectedYear, 10);
    const filteredData = categorizedData.filter(
      (monthly) => monthly.year === year,
    );

    if (filteredData.length === 0) {
      alert("No data available for the selected year");
      return;
    }

    // Arrange data by month
    const sortedData = arrangeDataByMonth(filteredData);
    const attendanceReports = processAttendanceReports({
      filteredData: sortedData,
      selectedRange: selectedYear,
    });

    console.log("attendanceReports ", attendanceReports);

    // Create a workbook
    const workbook = XLSX.utils.book_new();

    // Prepare the yearly sheet data
    const yearSheetName = `Year ${selectedYear}`;
    const yearSheetData: XLSX.CellObject[][] = [];

    sortedData.forEach((monthData, index) => {
      // Add two empty rows only at the beginning of the sheet
      if (index === 0) {
        yearSheetData.push([], []);
      }

      // Add the month header
      const monthHeader = [
        {
          v: `Month: ${monthData.month}`,
          t: "s",
          s: {
            font: {
              bold: true,
            },
            alignment: { horizontal: "center" },
          },
        },
      ];

      yearSheetData.push([
        { v: "", t: "s" },
        { v: "", t: "s" },
        ...monthHeader.map((cell) => ({ ...cell, t: cell.t as ExcelDataType })),
      ]);

      // Add table headers (weekend on the left, midweek on the right)
      yearSheetData.push([
        { v: "", t: "s" },
        { v: "", t: "s" }, // Left padding
        {
          v: "Weekend",
          t: "s",
          s: {
            font: {
              bold: true,
            },
            alignment: { horizontal: "center" },
          },
        },
        { v: "", t: "s" }, // Padding column
        { v: "", t: "s" }, // Padding column
        { v: "", t: "s" }, // Padding column
        { v: "", t: "s" }, // Padding column
        {
          v: "Midweek",
          t: "s",
          s: {
            font: {
              bold: true,
            },
            alignment: { horizontal: "center" },
          },
        },
      ]);

      yearSheetData.push([
        { v: "", t: "s" },
        { v: "", t: "s" }, // Left padding
        { v: "Date", t: "s", s: cellStyle },
        { v: "Deaf", t: "s", s: cellStyle },
        { v: "Hearing", t: "s", s: cellStyle },
        { v: "Total", t: "s", s: cellStyle },
        { v: "", t: "s" }, // Padding column
        { v: "Date", t: "s", s: cellStyle },
        { v: "Deaf", t: "s", s: cellStyle },
        { v: "Hearing", t: "s", s: cellStyle },
        { v: "Total", t: "s", s: cellStyle },
      ]);

      // Sort weekend data by date in ascending order
      monthData.weekend.sort(
        (a, b) =>
          new Date(a.date_mm_dd_yyyy).getTime() -
          new Date(b.date_mm_dd_yyyy).getTime(),
      );

      // Sort midweek data by date in ascending order
      monthData.midWeek.sort(
        (a, b) =>
          new Date(a.date_mm_dd_yyyy).getTime() -
          new Date(b.date_mm_dd_yyyy).getTime(),
      );

      // Add weekend data (left columns)
      const maxRows = Math.max(
        monthData.weekend.length,
        monthData.midWeek.length,
      );

      for (let i = 0; i < maxRows; i++) {
        const weekendRecord = monthData.weekend[i] || {};
        const midweekRecord = monthData.midWeek[i] || {};

        yearSheetData.push([
          { v: "", t: "s" },
          { v: "", t: "s" }, // Left padding
          { v: weekendRecord.date_mm_dd_yyyy || "", t: "s", s: BorderStyle },
          { v: weekendRecord.deaf || 0, t: "n", s: BorderStyle },
          { v: weekendRecord.hearing || 0, t: "n", s: BorderStyle },
          { v: weekendRecord.total || 0, t: "n", s: BorderStyle },
          { v: "", t: "s" }, // Spacer column
          { v: midweekRecord.date_mm_dd_yyyy || "", t: "s", s: BorderStyle },
          { v: midweekRecord.deaf || 0, t: "n", s: BorderStyle },
          { v: midweekRecord.hearing || 0, t: "n", s: BorderStyle },
          { v: midweekRecord.total || 0, t: "n", s: BorderStyle },
        ]);
      }

      // Add blank rows for spacing between months
      yearSheetData.push([], []);
    });

    // Prepare the reports sheet data
    const reportsSheetName = `Reports ${selectedYear}`;
    const reportsSheetData: XLSX.CellObject[][] = [];

    reportsSheetData.push([
      { v: "", t: "s" },
      { v: "", t: "s" }, // Left padding
      { v: "Reports", t: "s", s: { font: { bold: true, size: 14 } } },
    ]);

    reportsSheetData.push([
      { v: "", t: "s" },
      { v: "", t: "s" }, // Left padding
      {
        v: "Weekend Reports",
        t: "s",
        s: {
          font: { bold: true },
          alignment: { horizontal: "center" },
        },
      },
      { v: "", t: "s" }, // Padding column
      { v: "", t: "s" }, // Padding column
      { v: "", t: "s" }, // Padding column
      { v: "", t: "s" }, // Padding column
      { v: "", t: "s" }, // Padding column
      { v: "", t: "s" }, // Padding column

      {
        v: "Midweek Reports",
        t: "s",
        s: {
          font: { bold: true },
          alignment: { horizontal: "center" },
        },
      },
    ]);

    reportsSheetData.push([
      // { v: `Service Year ${report.month.year}`, t: "s" },
      { v: "", t: "s" }, // Left padding
      { v: "", t: "s" }, // Left padding
      { v: "Month", t: "s", s: cellStyle },
      { v: "Number of Meetings", t: "s", s: cellStyle },
      { v: "Total Attendance", t: "s", s: cellStyle },
      { v: "Average Attendance Each Week", t: "s", s: cellStyle },
      { v: " Deaf Total", t: "s", s: cellStyle },
      { v: "Deaf Average", t: "s", s: cellStyle },
      { v: "", t: "s" },
      { v: "Month", t: "s", s: cellStyle },
      { v: "Number of Meetings", t: "s", s: cellStyle },
      { v: "Total Attendance", t: "s", s: cellStyle },
      { v: "Average Attendance Each Week", t: "s", s: cellStyle },
      { v: " Deaf Total", t: "s", s: cellStyle },
      { v: "Deaf Average", t: "s", s: cellStyle },
    ]);

    attendanceReports.forEach((report) => {
      reportsSheetData.push([
        { v: "", t: "s" },
        { v: "", t: "s" }, // Left padding
        { v: `${report.month}`, t: "s", s: BorderStyle },
        { v: `${report.weekend.count}`, t: "s", s: BorderStyle },
        { v: `${report.weekend.total}`, t: "s", s: BorderStyle },
        {
          v: ` ${report.weekend.average}`,
          t: "s",
          s: BorderStyle,
        },
        {
          v: ` ${report.weekend.deafTotal}`,
          t: "s",
          s: BorderStyle,
        },
        {
          v: ` ${report.weekend.deafAverage}`,
          t: "s",
          s: BorderStyle,
        },
        { v: "", t: "s" },
        { v: ` ${report.month}`, t: "s", s: BorderStyle },
        { v: `${report.midWeek.count}`, t: "s", s: BorderStyle },
        { v: `${report.midWeek.total}`, t: "s", s: BorderStyle },
        {
          v: ` ${report.midWeek.average}`,
          t: "s",
          s: BorderStyle,
        },
        {
          v: ` ${report.midWeek.deafTotal}`,
          t: "s",
          s: BorderStyle,
        },
        {
          v: ` ${report.midWeek.deafAverage}`,
          t: "s",
          s: BorderStyle,
        },
      ]);
    });

    // Calculate and add yearly averages
    const yearlyWeekendAvg = calculateAverageAttendanceEachMonth(
      sortedData,
      "weekend",
    );
    const yearlyMidWeekAvg = calculateAverageAttendanceEachMonth(
      sortedData,
      "midWeek",
    );

    reportsSheetData.push([
      { v: "", t: "s" },
      { v: "", t: "s" },
      { v: "", t: "s" },
      { v: "", t: "s" },
      { v: "Each Month Average", t: "s", s: { font: { bold: true } } },
      { v: yearlyWeekendAvg.toFixed(2), t: "n", s: BorderStyle },
      { v: "", t: "s" },
      { v: "", t: "s" },
      { v: "", t: "s" },
      { v: "", t: "s" },
      { v: "", t: "s" },
      { v: "Each Month Average", t: "s", s: { font: { bold: true } } },
      { v: yearlyMidWeekAvg.toFixed(2), t: "n", s: BorderStyle },
    ]);

    const yearWorksheet = XLSX.utils.aoa_to_sheet(yearSheetData);
    const reportsWorksheet = XLSX.utils.aoa_to_sheet(reportsSheetData);

    // Merge cells for the month headers
    let rowIndex = 2; // Account for the initial empty rows
    sortedData.forEach((monthData) => {
      const monthHeaderRange: XLSX.Range = {
        s: { r: rowIndex, c: 2 }, // Start of the month header (after padding)
        e: { r: rowIndex, c: 10 }, // End of the month header
      };

      if (!yearWorksheet["!merges"]) yearWorksheet["!merges"] = [];
      yearWorksheet["!merges"].push(monthHeaderRange);

      // Merge cells for the Weekend and Midweek headers
      const weekendHeaderRange: XLSX.Range = {
        s: { r: rowIndex + 1, c: 2 },
        e: { r: rowIndex + 1, c: 5 },
      };
      yearWorksheet["!merges"].push(weekendHeaderRange);

      const midweekHeaderRange: XLSX.Range = {
        s: { r: rowIndex + 1, c: 7 },
        e: { r: rowIndex + 1, c: 10 },
      };
      yearWorksheet["!merges"].push(midweekHeaderRange);

      rowIndex +=
        Math.max(monthData.weekend.length, monthData.midWeek.length) + 5; // Rows for data and blank rows
    });

    // Set column widths for year sheet
    yearWorksheet["!cols"] = [
      { wch: 5 }, // Padding column 1
      { wch: 5 }, // Padding column 2
      { wch: 20 }, // Date (Weekend)
      { wch: 10 }, // Deaf (Weekend)
      { wch: 10 }, // Hearing (Weekend)
      { wch: 10 }, // Total (Weekend)
      { wch: 5 }, // Spacer column
      { wch: 20 }, // Date (Midweek)
      { wch: 10 }, // Deaf (Midweek)
      { wch: 10 }, // Hearing (Midweek)
      { wch: 10 }, // Total (Midweek)
    ];

    // Set column widths for reports sheet
    reportsWorksheet["!cols"] = [
      { wch: 5 }, // Padding column 1
      { wch: 5 }, // Padding column 2
      { wch: 20 }, // Month
      { wch: 20 }, // Number of Meetings
      { wch: 20 }, // Total Attendance
      { wch: 30 }, // Average Attendance Each Week
      { wch: 20 }, // Deaf Total
      { wch: 20 }, // Deaf Average
      { wch: 5 }, // Spacer column
      { wch: 20 }, // Month
      { wch: 20 }, // Number of Meetings
      { wch: 20 }, // Total Attendance
      { wch: 30 }, // Average Attendance Each Week
      { wch: 20 }, // Deaf Total
      { wch: 20 }, // Deaf Average
    ];

    XLSX.utils.book_append_sheet(workbook, yearWorksheet, yearSheetName);
    XLSX.utils.book_append_sheet(workbook, reportsWorksheet, reportsSheetName);

    // Generate and download the Excel file
    const buffer = XLSX.write(workbook, { type: "array", bookType: "xlsx" });
    const blob = new Blob([buffer], { type: "application/octet-stream" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `attendance_report_${selectedYear}.xlsx`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  return (
    <>
      {/* Download year part */}
      <div className="flex flex-col items-center justify-center gap-2">
        <h2 className="font-bold">Per year:</h2>
        <div className="flex flex-col items-center justify-center gap-2 sm:flex-row">
          {/* Autocomplete for selecting a year */}
          <Autocomplete
            aria-label="input year"
            variant="bordered"
            items={years.map((year) => ({ label: year, value: year }))}
            placeholder="Year"
            className="w-[50%]"
            onSelectionChange={(key) => setSelectedYear(key as string)}
          >
            {(item) => (
              <AutocompleteItem key={item.value}>{item.label}</AutocompleteItem>
            )}
          </Autocomplete>
          <Button
            color="primary"
            size="md"
            onClick={handleYearlyDownloadButtonClick}
          >
            Download
          </Button>
        </div>
      </div>
    </>
  );
};
