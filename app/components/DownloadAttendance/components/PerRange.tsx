import { Autocomplete, AutocompleteItem, Button } from "@nextui-org/react";
import React, { useState } from "react";
import { fetchLatestAttendance } from "@/utils/supabase/database";
import { sortingMonthlyAttendanceData } from "../functions/DownloadAttendanceUtils";
import { MonthlyAttendance } from "../../types/attendanceTypes";

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
    console.log("handlePerRangeDownloadButtonClick...");
    const latestAttendance = await fetchLatestAttendance();
    console.log(
      "latestAttendance in handlePerRangeDownloadButtonClick",
      latestAttendance,
    );
    const categorizedData = sortingMonthlyAttendanceData(latestAttendance);
    setSortedAttendanceData(categorizedData);
    console.log("Sorted Attendance Data: ", categorizedData);
    console.log(
      "selectedStartMonth in handlePerRangeDownloadButtonClick",
      selectedStartMonth,
    );
    console.log(
      "selectedStartYear in handlePerRangeDownloadButtonClick",
      selectedStartYear,
    );
    console.log(
      "selectedEndMonth in handlePerRangeDownloadButtonClick",
      selectedEndMonth,
    );
    console.log(
      "selectedEndYear in handlePerRangeDownloadButtonClick",
      selectedEndYear,
    );
    console.log("handlePerRangeDownloadButtonClick is finish");
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
