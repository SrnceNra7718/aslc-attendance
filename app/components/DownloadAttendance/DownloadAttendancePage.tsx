"use client";
import { Autocomplete, AutocompleteItem } from "@nextui-org/react";
import { AttendanceRecord } from "../types/attendanceTypes";
import { useState } from "react";
import AttendanceTable from "../AttendanceUpdates/AttendanceTable";

export const DownloadAttendancePage = () => {
  const [attendanceData, setAttendanceData] = useState<AttendanceRecord[]>([]);
  const [months, setMonths] = useState<string[]>([]);
  const [years, setYears] = useState<string[]>([]);
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null);
  const [selectedYear, setSelectedYear] = useState<string | null>(null);

  return (
    <div className="flex scale-90 flex-col items-center justify-center py-[14vw]">
      <h1 className="mb-2 text-[5vw] font-bold max-sm:text-[7vw]">
        Download Attendance
      </h1>
      <div className="m-[3vw] flex w-full flex-col items-center justify-center rounded-3xl bg-accent py-[3vw]">
        <div className="m-2 flex gap-2">
          {/* Autocomplete for selecting a month */}
          <Autocomplete
            aria-label="input month"
            variant="bordered"
            items={months.map((month) => ({
              label: month,
              value: month,
            }))}
            placeholder="Month"
            className="w-[50vw] md:max-w-[25vw]"
            onSelectionChange={(key) => setSelectedMonth(key as string)}
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
            className="w-[40vw] md:max-w-[18vw]"
            onSelectionChange={(key) => setSelectedYear(key as string)}
          >
            {(item) => (
              <AutocompleteItem key={item.value}>{item.label}</AutocompleteItem>
            )}
          </Autocomplete>
        </div>
        {/* Display the selected month and year */}
        <h2 className="mt-1 text-[3vw] font-bold max-sm:text-[5vw]">
          {selectedMonth && selectedYear
            ? `${selectedMonth} ${selectedYear}`
            : selectedYear
              ? "Select Month"
              : selectedMonth
                ? "Select Year"
                : "Select Month and Year"}
        </h2>
        {selectedMonth && selectedYear ? (
          <AttendanceTable
            selectedMonth={selectedMonth}
            selectedYear={selectedYear}
          />
        ) : (
          <div className="flex w-full items-center justify-center"></div>
        )}
      </div>
    </div>
  );
};
