// Updated PerYear.tsx
import React, { useState } from "react";
import { MonthlyAttendance } from "../../types/attendanceTypes";
import { fetchLatestAttendance } from "@/utils/supabase/database";
import { sortingMonthlyAttendanceData } from "../functions/DownloadAttendanceUtils";
import { Autocomplete, AutocompleteItem, Button } from "@nextui-org/react";
import * as XLSX from "xlsx";
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

  const handleYearlyDownloadButtonClick = async () => {
    if (!selectedYear) {
      alert("Please select a year");
      return;
    }

    const latestAttendance = await fetchLatestAttendance();
    const categorizedData = sortingMonthlyAttendanceData(latestAttendance);
    setSortedAttendanceData(categorizedData);

    const year = parseInt(selectedYear, 10);
    const filteredData = categorizedData.filter(
      (monthly) => monthly.year === year,
    );

    if (filteredData.length === 0) {
      alert("No data available for the selected year");
      return;
    }

    // Create workbook
    const workbook = XLSX.utils.book_new();

    // Add sheet for the year
    const yearSheetName = `Year ${selectedYear}`;
    const yearSheetData: any[] = [];

    // Process each month and add tables
    filteredData.forEach((monthData) => {
      yearSheetData.push([
        `Month: ${monthData.month}`,
        "Meeting Type",
        "Date",
        "Hearing",
        "Deaf",
        "Total",
      ]);
      [...monthData.midWeek, ...monthData.weekend].forEach((record) => {
        yearSheetData.push([
          "",
          record.meeting_type,
          record.date_mm_dd_yyyy,
          record.hearing,
          record.deaf,
          record.total,
        ]);
      });
      yearSheetData.push([]); // Blank row between months
    });

    const worksheet = XLSX.utils.aoa_to_sheet(yearSheetData);
    XLSX.utils.book_append_sheet(workbook, worksheet, yearSheetName);

    // Generate and download
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
