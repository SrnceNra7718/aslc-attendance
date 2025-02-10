import React, { useState } from "react";
import { MonthlyAttendance } from "../../types/attendanceTypes";
import { fetchLatestAttendance } from "@/utils/supabase/database";
import { sortingMonthlyAttendanceData } from "../functions/DownloadAttendanceUtils";
import { Autocomplete, AutocompleteItem, Button } from "@nextui-org/react";

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
    console.log("handleYearlyDownloadButtonClick...");
    const latestAttendance = await fetchLatestAttendance();
    console.log(
      "latestAttendance in handleYearlyDownloadButtonClick",
      latestAttendance,
    );
    const categorizedData = sortingMonthlyAttendanceData(latestAttendance);
    setSortedAttendanceData(categorizedData);
    console.log("Sorted Attendance Data: ", categorizedData);
    console.log(
      "selectedYear in handleYearlyDownloadButtonClick",
      selectedYear,
    );
    console.log("handleYearlyDownloadButtonClick is finish");
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
            items={years.map((year) => ({
              label: year,
              value: year,
            }))}
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
