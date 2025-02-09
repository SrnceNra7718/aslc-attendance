"use client";
import { Autocomplete, AutocompleteItem, Button } from "@nextui-org/react";
import { AttendanceRecord } from "../types/attendanceTypes";
import { useState } from "react";

export const DownloadAttendancePage = () => {
  const [attendanceData, setAttendanceData] = useState<AttendanceRecord[]>([]);
  const [months, setMonths] = useState<string[]>([]);
  const [years, setYears] = useState<string[]>([]);
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null);
  const [selectedYear, setSelectedYear] = useState<string | null>(null);

  return (
    <div className="flex scale-90 flex-col items-center justify-center pb-[14vw]">
      <h1 className="mb-2 text-[5vw] font-bold max-sm:text-[7vw]">
        Download Attendance
      </h1>
      <div className="m-[3vw] flex w-full flex-col items-center justify-center gap-4 rounded-3xl bg-accent py-[3vw]">
        {/* Download ALL part */}
        <div>
          <Button color="primary" size="lg">
            ALL
          </Button>
        </div>
        {/* Divider */}
        <div className="h-[0.1vw] w-[60vw] bg-slate-50" />

        {/* Per range */}
        <div className="flex flex-col items-center justify-center gap-2">
          <h2 className="font-bold">Per range:</h2>

          {/* start range */}
          <div className="flex flex-row gap-2">
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
              onSelectionChange={(key) => setSelectedMonth(key as string)}
            >
              {(item) => (
                <AutocompleteItem key={item.value}>
                  {item.label}
                </AutocompleteItem>
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
              onSelectionChange={(key) => setSelectedYear(key as string)}
            >
              {(item) => (
                <AutocompleteItem key={item.value}>
                  {item.label}
                </AutocompleteItem>
              )}
            </Autocomplete>
          </div>
          {/* end range */}
          <div className="flex flex-row gap-2">
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
              onSelectionChange={(key) => setSelectedMonth(key as string)}
            >
              {(item) => (
                <AutocompleteItem key={item.value}>
                  {item.label}
                </AutocompleteItem>
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
              onSelectionChange={(key) => setSelectedYear(key as string)}
            >
              {(item) => (
                <AutocompleteItem key={item.value}>
                  {item.label}
                </AutocompleteItem>
              )}
            </Autocomplete>
          </div>
          <Button color="primary" size="lg">
            Range
          </Button>
        </div>

        {/* Divider */}
        <div className="h-[0.1vw] w-[60vw] bg-slate-50" />
      </div>
    </div>
  );
};
