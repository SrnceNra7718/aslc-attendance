// Updated PerYear.tsx
import React, { useState } from "react";
import { MonthlyAttendance } from "../../types/attendanceTypes";
import { fetchLatestAttendance } from "@/utils/supabase/database";
import { sortingMonthlyAttendanceData } from "../functions/DownloadAttendanceUtils";
import { Autocomplete, AutocompleteItem, Button } from "@nextui-org/react";
import XLSX, { ExcelDataType } from "xlsx-js-style"; // Use xlsx-js-style for styling support

import { processAttendanceReports } from "../functions/ReportsToDownload";

interface PerYearProps {
  months: string[];
  years: string[];
}

export const PerYear: React.FC<PerYearProps> = ({ months, years }) => {
  const [SortedAttendanceData, setSortedAttendanceData] = useState<
    MonthlyAttendance[]
  >([]);

  // Per Year
  const [selectedYear, setSelectedYear] = useState<string | null>(null);

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
    setSortedAttendanceData(categorizedData);

    const year = parseInt(selectedYear, 10);
    const filteredData = categorizedData.filter(
      (monthly) => monthly.year === year,
    );

    if (filteredData.length === 0) {
      alert("No data available for the selected year");
      return;
    }

    // Create a workbook
    const workbook = XLSX.utils.book_new();

    // Define a single style object for easier maintenance
    const cellStyle = {
      font: { bold: true },
      border: {
        top: { style: "thin" },
        bottom: { style: "thin" },
        left: { style: "thin" },
        right: { style: "thin" },
      },
    };

    // Prepare the yearly sheet data
    const yearSheetName = `Year ${selectedYear}`;
    const yearSheetData: XLSX.CellObject[][] = [];

    filteredData.forEach((monthData, index) => {
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
          { v: weekendRecord.date_mm_dd_yyyy || "", t: "s", s: cellStyle },
          { v: weekendRecord.deaf || 0, t: "n", s: cellStyle },
          { v: weekendRecord.hearing || 0, t: "n", s: cellStyle },
          { v: weekendRecord.total || 0, t: "n", s: cellStyle },
          { v: "", t: "s" }, // Spacer column
          { v: midweekRecord.date_mm_dd_yyyy || "", t: "s", s: cellStyle },
          { v: midweekRecord.deaf || 0, t: "n", s: cellStyle },
          { v: midweekRecord.hearing || 0, t: "n", s: cellStyle },
          { v: midweekRecord.total || 0, t: "n", s: cellStyle },
        ]);
      }

      // Add blank rows for spacing between months
      yearSheetData.push([], []);
    });

    const worksheet = XLSX.utils.aoa_to_sheet(yearSheetData);

    // Merge cells for the month headers
    let rowIndex = 2; // Account for the initial empty rows
    filteredData.forEach((monthData) => {
      const monthHeaderRange: XLSX.Range = {
        s: { r: rowIndex, c: 2 }, // Start of the month header (after padding)
        e: { r: rowIndex, c: 10 }, // End of the month header
      };
      if (!worksheet["!merges"]) worksheet["!merges"] = [];
      worksheet["!merges"].push(monthHeaderRange);

      // Merge cells for the Weekend and Midweek headers
      const weekendHeaderRange: XLSX.Range = {
        s: { r: rowIndex + 1, c: 2 },
        e: { r: rowIndex + 1, c: 5 },
      };
      worksheet["!merges"].push(weekendHeaderRange);

      const midweekHeaderRange: XLSX.Range = {
        s: { r: rowIndex + 1, c: 7 },
        e: { r: rowIndex + 1, c: 10 },
      };
      worksheet["!merges"].push(midweekHeaderRange);

      rowIndex +=
        Math.max(monthData.weekend.length, monthData.midWeek.length) + 5; // Rows for data and blank rows
    });

    // Set column widths
    worksheet["!cols"] = [
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

    XLSX.utils.book_append_sheet(workbook, worksheet, yearSheetName);

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
