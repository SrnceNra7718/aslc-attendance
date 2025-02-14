// Updated PerRange.tsx
import { Autocomplete, AutocompleteItem, Button } from "@nextui-org/react";
import React, { useState } from "react";
import { fetchLatestAttendance } from "@/utils/supabase/database";
import { sortingMonthlyAttendanceData } from "../functions/DownloadAttendanceUtils";
import { MonthlyAttendance } from "../../types/attendanceTypes";
import XLSX, { ExcelDataType } from "xlsx-js-style"; // Use xlsx-js-style for styling support
import {
  processAttendanceReports,
  calculateAverageAttendanceEachMonth,
} from "../functions/ReportsToDownload";
import { BorderStyle, cellStyle } from "./PerYear";

interface PerRangeProps {
  months: string[];
  years: string[];
}

export const PerRange: React.FC<PerRangeProps> = ({ months, years }) => {
  const [SortedAttendanceData, setSortedAttendanceData] = useState<
    MonthlyAttendance[]
  >([]);
  const [weekendAverage, setWeekendAverage] = useState<number>(0);
  const [midWeekAverage, setMidWeekAverage] = useState<number>(0);

  // Per Range
  const [selectedStartMonth, setSelectedStartMonth] = useState<string | null>(
    null,
  );
  const [selectedEndMonth, setSelectedEndMonth] = useState<string | null>(null);
  const [selectedStartYear, setSelectedStartYear] = useState<string | null>(
    null,
  );
  const [selectedEndYear, setSelectedEndYear] = useState<string | null>(null);

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

  const handlePerRangeDownloadButtonClick = async () => {
    if (
      !selectedStartMonth ||
      !selectedStartYear ||
      !selectedEndMonth ||
      !selectedEndYear
    ) {
      alert("Please select start and end month/year");
      return;
    }

    // Parse date range
    const startDate = new Date(`${selectedStartMonth} 1, ${selectedStartYear}`);
    const endDate = new Date(`${selectedEndMonth} 1, ${selectedEndYear}`);
    endDate.setMonth(endDate.getMonth() + 1);
    endDate.setDate(0); // Last day of end month

    if (startDate > endDate) {
      alert("Start date must be before end date");
      return;
    }

    const latestAttendance = await fetchLatestAttendance();
    const categorizedData = sortingMonthlyAttendanceData(latestAttendance);

    // Filter data within date range
    const filteredData = categorizedData.filter((monthly) => {
      const monthlyDate = new Date(`${monthly.month} 1, ${monthly.year}`);
      return monthlyDate >= startDate && monthlyDate <= endDate;
    });

    // Arrange data by month
    const sortedData = arrangeDataByMonth(filteredData);
    setSortedAttendanceData(sortedData);

    // Calculate averages
    const weekendAvg = calculateAverageAttendanceEachMonth(
      sortedData,
      "weekend",
    );
    const midWeekAvg = calculateAverageAttendanceEachMonth(
      sortedData,
      "midWeek",
    );
    setWeekendAverage(weekendAvg);
    setMidWeekAverage(midWeekAvg);

    // Group by year
    const groupedByYear: { [key: number]: MonthlyAttendance[] } =
      sortedData.reduce(
        (acc, monthly) => {
          if (!acc[monthly.year]) {
            acc[monthly.year] = [];
          }
          acc[monthly.year].push(monthly);
          return acc;
        },
        {} as { [key: number]: MonthlyAttendance[] },
      );

    if (Object.keys(groupedByYear).length === 0) {
      alert("No data available for the selected range");
      return;
    }

    // Create workbook with multiple sheets
    const workbook = XLSX.utils.book_new();

    // Create one sheet per year with monthly tables
    Object.entries(groupedByYear).forEach(([year, monthlyData]) => {
      const yearSheetData: XLSX.CellObject[][] = [];

      monthlyData.forEach((monthData, index) => {
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
          ...monthHeader.map((cell) => ({
            ...cell,
            t: cell.t as ExcelDataType,
          })),
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

      const yearWorksheet = XLSX.utils.aoa_to_sheet(yearSheetData);

      // Merge cells for the months headers
      let rowIndex = 2; // Account for the initial empty rows
      monthlyData.forEach((monthData) => {
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

      XLSX.utils.book_append_sheet(workbook, yearWorksheet, `Year ${year}`);
    });

    // Add consolidated reports sheet with separate tables per year
    const reportsSheetName = `Reports`;
    const reportsSheetData: XLSX.CellObject[][] = [];

    // Main reports title
    reportsSheetData.push([
      { v: "", t: "s" },
      { v: "", t: "s" },
      { v: "Reports", t: "s", s: { font: { bold: true, size: 14 } } },
    ]);

    // Create separate tables for each year
    Object.entries(groupedByYear).forEach(([year, monthlyData]) => {
      // Year header
      reportsSheetData.push([
        { v: "", t: "s" },
        { v: "", t: "s" },
        {
          v: `Year ${year} Reports`,
          t: "s",
          s: {
            font: { bold: true },
            alignment: { horizontal: "center" },
          },
        },
      ]);

      // Add empty row for spacing
      reportsSheetData.push([]);

      // Weekend and Midweek headers
      reportsSheetData.push([
        { v: "", t: "s" },
        { v: "", t: "s" },
        {
          v: "Weekend Reports",
          t: "s",
          s: { font: { bold: true }, alignment: { horizontal: "center" } },
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
          s: { font: { bold: true }, alignment: { horizontal: "center" } },
        },
      ]);

      // Add empty row for spacing
      reportsSheetData.push([]);

      // Headers for the table
      reportsSheetData.push([
        { v: "", t: "s" }, // Left padding
        { v: "", t: "s" }, // Left padding
        { v: "Month", t: "s", s: cellStyle },
        { v: "Number of Meetings", t: "s", s: cellStyle },
        { v: "Total Attendance", t: "s", s: cellStyle },
        { v: "Average Attendance Each Week", t: "s", s: cellStyle },
        { v: "Deaf Total", t: "s", s: cellStyle },
        { v: "Deaf Average", t: "s", s: cellStyle },
        { v: "", t: "s" }, // Spacer column
        { v: "Month", t: "s", s: cellStyle },
        { v: "Number of Meetings", t: "s", s: cellStyle },
        { v: "Total Attendance", t: "s", s: cellStyle },
        { v: "Average Attendance Each Week", t: "s", s: cellStyle },
        { v: "Deaf Total", t: "s", s: cellStyle },
        { v: "Deaf Average", t: "s", s: cellStyle },
      ]);

      const attendanceReports = processAttendanceReports({
        filteredData: monthlyData,
        selectedRange: `${selectedStartMonth}_${selectedStartYear}_to_${selectedEndMonth}_${selectedEndYear}`,
      });

      attendanceReports.forEach((report) => {
        reportsSheetData.push([
          { v: "", t: "s" },
          { v: "", t: "s" }, // Left padding
          { v: `${report.month}`, t: "s", s: BorderStyle },
          { v: `${report.weekend.count}`, t: "n", s: BorderStyle },
          { v: `${report.weekend.total}`, t: "n", s: BorderStyle },
          { v: `${report.weekend.average}`, t: "n", s: BorderStyle },
          { v: `${report.weekend.deafTotal}`, t: "n", s: BorderStyle },
          { v: `${report.weekend.deafAverage}`, t: "n", s: BorderStyle },
          { v: "", t: "s" }, // Spacer column
          { v: `${report.month}`, t: "s", s: BorderStyle },
          { v: `${report.midWeek.count}`, t: "n", s: BorderStyle },
          { v: `${report.midWeek.total}`, t: "n", s: BorderStyle },
          { v: `${report.midWeek.average}`, t: "n", s: BorderStyle },
          { v: `${report.midWeek.deafTotal}`, t: "n", s: BorderStyle },
          { v: `${report.midWeek.deafAverage}`, t: "n", s: BorderStyle },
        ]);
      });

      // Calculate and add yearly averages
      const yearlyWeekendAvg = calculateAverageAttendanceEachMonth(
        monthlyData,
        "weekend",
      );
      const yearlyMidWeekAvg = calculateAverageAttendanceEachMonth(
        monthlyData,
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

      // Add blank rows for spacing between years
      reportsSheetData.push([], []);
    });

    // --- Merge settings for the Reports sheet ---
    const reportsWorksheet = XLSX.utils.aoa_to_sheet(reportsSheetData);
    if (!reportsWorksheet["!merges"]) reportsWorksheet["!merges"] = [];

    // Merge the top "Reports" title row (row 0) from col2 to col14
    reportsWorksheet["!merges"].push({
      s: { r: 0, c: 2 },
      e: { r: 0, c: 14 },
    });

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

    XLSX.utils.book_append_sheet(workbook, reportsWorksheet, reportsSheetName);

    // Generate and download the Excel file
    const buffer = XLSX.write(workbook, { type: "array", bookType: "xlsx" });
    const blob = new Blob([buffer], { type: "application/octet-stream" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `attendance_report_${selectedStartMonth}_${selectedStartYear}_to_${selectedEndMonth}_${selectedEndYear}.xlsx`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };
  return (
    <>
      {/* Per range */}
      <div className="flex flex-col items-center justify-center gap-2">
        <h2 className="font-bold">Per range:</h2>

        {/* start range */}
        <div className="flex flex-col gap-2 sm:flex-row">
          <h3 className="font-bold">start:</h3>
          {/* Autocomplete for selecting a month */}
          <Autocomplete
            aria-label="input month"
            variant="bordered"
            items={months.map((month) => ({
              label: month,
              value: month,
            }))}
            placeholder="Month"
            className=""
            onSelectionChange={(key) => setSelectedStartMonth(key as string)}
          >
            {(item) => (
              <AutocompleteItem key={item.value}>{item.label}</AutocompleteItem>
            )}
          </Autocomplete>

          {/* Autocomplete for selecting a year */}
          <Autocomplete
            aria-label="input year"
            variant="bordered"
            items={years.map((year) => ({
              label: year,
              value: year,
            }))}
            placeholder="Year"
            className=""
            onSelectionChange={(key) => setSelectedStartYear(key as string)}
          >
            {(item) => (
              <AutocompleteItem key={item.value}>{item.label}</AutocompleteItem>
            )}
          </Autocomplete>
        </div>
        {/* end range */}
        <div className="flex flex-col gap-2 sm:flex-row">
          <h3 className="font-bold">end:</h3>
          {/* Autocomplete for selecting a month */}
          <Autocomplete
            aria-label="input month"
            variant="bordered"
            items={months.map((month) => ({
              label: month,
              value: month,
            }))}
            placeholder="Month"
            className=""
            onSelectionChange={(key) => setSelectedEndMonth(key as string)}
          >
            {(item) => (
              <AutocompleteItem key={item.value}>{item.label}</AutocompleteItem>
            )}
          </Autocomplete>

          {/* Autocomplete for selecting a year */}
          <Autocomplete
            aria-label="input year"
            variant="bordered"
            items={years.map((year) => ({
              label: year,
              value: year,
            }))}
            placeholder="Year"
            className=""
            onSelectionChange={(key) => setSelectedEndYear(key as string)}
          >
            {(item) => (
              <AutocompleteItem key={item.value}>{item.label}</AutocompleteItem>
            )}
          </Autocomplete>
        </div>
        <Button
          color="primary"
          size="md"
          onClick={handlePerRangeDownloadButtonClick}
        >
          Download
        </Button>
      </div>
    </>
  );
};
