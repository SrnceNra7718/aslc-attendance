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

    const workbook = XLSX.utils.book_new();
    const yearSheetName = `Year ${selectedYear}`;
    const yearSheetData: any[] = [];

    const getWeekOfMonth = (dateString: string) => {
      const date = new Date(dateString);
      return Math.ceil(date.getDate() / 7);
    };

    filteredData.forEach((monthData) => {
      yearSheetData.push([`Month: ${monthData.month}`]);

      yearSheetData.push([
        "Meeting Type",
        "1st week",
        "",
        "",
        "2nd week",
        "",
        "",
        "3rd week",
        "",
        "",
        "4th week",
        "",
        "",
        "5th week",
        "",
        "",
      ]);

      // Add the duplicated header for both "Mid-week" and "Weekend"
      const addHeaderRows = () => {
        yearSheetData.push([
          "",
          "Deaf",
          "Hearing",
          "Total",
          "Deaf",
          "Hearing",
          "Total",
          "Deaf",
          "Hearing",
          "Total",
          "Deaf",
          "Hearing",
          "Total",
          "Deaf",
          "Hearing",
          "Total",
        ]);
      };

      const processMeetings = (meetings: any[], type: string) => {
        const grouped: {
          [key: number]: {
            dates: string[];
            deaf: number;
            hearing: number;
            total: number;
          };
        } = {};

        meetings.forEach((meeting) => {
          const week = getWeekOfMonth(meeting.date_mm_dd_yyyy);
          if (!grouped[week]) {
            grouped[week] = { dates: [], deaf: 0, hearing: 0, total: 0 };
          }
          grouped[week].dates.push(meeting.date_mm_dd_yyyy);
          grouped[week].deaf += meeting.deaf;
          grouped[week].hearing += meeting.hearing;
          grouped[week].total = grouped[week].deaf + grouped[week].hearing; // Calculate total
        });

        const rowDates = [type]; // Type column for dates
        const rowData = [type]; // Type column for data
        for (let week = 1; week <= 5; week++) {
          const data = grouped[week] || {
            dates: [""],
            deaf: [""],
            hearing: [""],
            total: [""],
          };
          rowDates.push(data.dates.join(", "), "", ""); // Add dates for the week
          rowData.push(
            data.deaf.toString(),
            data.hearing.toString(),
            data.total.toString(),
          ); // Add Deaf, Hearing, and Total for the week
        }

        yearSheetData.push(rowDates);
        addHeaderRows();
        yearSheetData.push(rowData);
      };

      processMeetings(monthData.midWeek, "Mid-week");
      processMeetings(monthData.weekend, "Weekend");

      // Add a blank row for spacing between months
      yearSheetData.push([]);
    });

    // Create the worksheet and merge header cells for weeks
    const worksheet = XLSX.utils.aoa_to_sheet(yearSheetData);

    // Merge headers
    let rowIndex = 0;
    filteredData.forEach((_, monthIndex) => {
      // Merge month header
      worksheet["!merges"] = worksheet["!merges"] || [];

      worksheet["!merges"].push({
        s: { r: rowIndex, c: 0 },
        e: { r: rowIndex, c: 15 }, // Adjust column span as needed
      });

      // Merge week headers
      const startHeaderRow = rowIndex + 1;
      worksheet["!merges"].push({
        s: { r: startHeaderRow, c: 1 },
        e: { r: startHeaderRow, c: 3 },
      }); // 1st week
      worksheet["!merges"].push({
        s: { r: startHeaderRow, c: 4 },
        e: { r: startHeaderRow, c: 6 },
      }); // 2nd week
      worksheet["!merges"].push({
        s: { r: startHeaderRow, c: 7 },
        e: { r: startHeaderRow, c: 9 },
      }); // 3rd week
      worksheet["!merges"].push({
        s: { r: startHeaderRow, c: 10 },
        e: { r: startHeaderRow, c: 12 },
      }); // 4th week
      worksheet["!merges"].push({
        s: { r: startHeaderRow, c: 13 },
        e: { r: startHeaderRow, c: 15 },
      }); // 5th week

      // Merge date headers
      const dateHeaderRow = rowIndex + 2;
      for (let col = 1; col <= 15; col += 3) {
        worksheet["!merges"].push({
          s: { r: dateHeaderRow, c: col },
          e: { r: dateHeaderRow, c: col + 2 },
        });
      }

      const weekendDatesRow = rowIndex + 5; // Row containing dates for "Weekend"
      for (let col = 1; col <= 15; col += 3) {
        worksheet["!merges"].push({
          s: { r: weekendDatesRow, c: col },
          e: { r: weekendDatesRow, c: col + 2 },
        });
      }

      rowIndex += 9; // Adjust row index for the next month's data
    });

    XLSX.utils.book_append_sheet(workbook, worksheet, yearSheetName);

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
