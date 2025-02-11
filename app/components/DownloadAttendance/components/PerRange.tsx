// Updated PerRange.tsx
import { Autocomplete, AutocompleteItem, Button } from "@nextui-org/react";
import React, { useState } from "react";
import { fetchLatestAttendance } from "@/utils/supabase/database";
import { sortingMonthlyAttendanceData } from "../functions/DownloadAttendanceUtils";
import {
  MonthlyAttendance,
  AttendanceRecord,
} from "../../types/attendanceTypes";
import * as XLSX from "xlsx";
import { processAttendanceReports } from "../functions/ReportsToDownload";

interface PerRangeProps {
  months: string[];
  years: string[];
}

export const PerRange: React.FC<PerRangeProps> = ({ months, years }) => {
  const [SortedAttendanceData, setSortedAttendanceData] = useState<
    MonthlyAttendance[]
  >([]);

  // Per Range
  const [selectedStartMonth, setSelectedStartMonth] = useState<string | null>(
    null,
  );
  const [selectedEndMonth, setSelectedEndMonth] = useState<string | null>(null);
  const [selectedStartYear, setSelectedStartYear] = useState<string | null>(
    null,
  );
  const [selectedEndYear, setSelectedEndYear] = useState<string | null>(null);

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
    setSortedAttendanceData(categorizedData);

    // Filter data within date range
    const filteredData = categorizedData.filter((monthly) => {
      const monthlyDate = new Date(`${monthly.month} 1, ${monthly.year}`);
      return monthlyDate >= startDate && monthlyDate <= endDate;
    });

    // Group by year
    const groupedByYear = filteredData.reduce(
      (acc: { [key: number]: MonthlyAttendance[] }, monthly) => {
        acc[monthly.year] = acc[monthly.year] || [];
        acc[monthly.year].push(monthly);
        return acc;
      },
      {},
    );

    if (Object.keys(groupedByYear).length === 0) {
      alert("No data available for the selected range");
      return;
    }

    // Create workbook with multiple sheets
    const workbook = XLSX.utils.book_new();

    Object.entries(groupedByYear).forEach(([year, monthlyData]) => {
      const yearSheetData: any[] = [];

      monthlyData.forEach((monthData) => {
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
      XLSX.utils.book_append_sheet(workbook, worksheet, `Year ${year}`);
    });

    // Add consolidated reports sheet
    processAttendanceReports({
      filteredData,
      workbook,
      selectedRange: `${selectedStartMonth}_${selectedStartYear}_to_${selectedEndMonth}_${selectedEndYear}`,
    });

    // Generate and download
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
