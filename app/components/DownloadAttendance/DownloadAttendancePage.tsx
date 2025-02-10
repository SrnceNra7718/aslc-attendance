"use client";
import { Autocomplete, AutocompleteItem, Button } from "@nextui-org/react";
import { AttendanceRecord, MonthlyAttendance } from "../types/attendanceTypes";
import { useEffect, useState } from "react";
import { sortingMonthlyAttendanceData } from "../functions/DownloadAttendanceUtils"; // Import the function
import {
  fetchLatestAttendance,
  subscribeToAttendanceChanges,
} from "@/utils/supabase/database";

export const DownloadAttendancePage = () => {
  const [attendanceData, setAttendanceData] = useState<AttendanceRecord[]>([]);
  const [SortedAttendanceData, setSortedAttendanceData] = useState<
    MonthlyAttendance[]
  >([]);

  const [months, setMonths] = useState<string[]>([]);
  const [years, setYears] = useState<string[]>([]);
  const [selectedYear, setSelectedYear] = useState<string | null>(null);

  const [selectedStartMonth, setSelectedStartMonth] = useState<string | null>(
    null,
  );
  const [selectedEndMonth, setSelectedEndMonth] = useState<string | null>(null);
  const [selectedStartYear, setSelectedStartYear] = useState<string | null>(
    null,
  );
  const [selectedEndYear, setSelectedEndYear] = useState<string | null>(null);

  // Load initial data and subscribe to updates
  useEffect(() => {
    /**
     * Fetches the latest attendance data and updates the state with the fetched data.
     * Logs the loaded attendance data to the console.
     * Categorizes the attendance data by month and logs the categorized data to the console.
     *
     * @async
     * @function fetchData
     * @returns {Promise<void>} A promise that resolves when the data fetching and processing are complete.
     */
    const fetchData = async () => {
      const latestAttendance = await fetchLatestAttendance();
      setAttendanceData(latestAttendance);
      console.log("loading attendanceData: ", latestAttendance);

      // Categorize the attendance data after loading
      const categorizedData = sortingMonthlyAttendanceData(latestAttendance);
      setSortedAttendanceData(categorizedData);
      console.log("Categorized Attendance Data: ", categorizedData);
    };

    fetchData();

    // Subscribe to attendance data updates in real-time
    const unsubscribe = subscribeToAttendanceChanges(
      (updatedData: AttendanceRecord[]) => {
        setAttendanceData(updatedData);
        const categorizedData = sortingMonthlyAttendanceData(updatedData);
        setSortedAttendanceData(categorizedData);
        updateMonthsAndYears(categorizedData);
      },
    );

    return () => unsubscribe(); // Cleanup subscription on unmount
  }, []);

  // Update months and years when SortedAttendanceData changes
  const updateMonthsAndYears = (data: MonthlyAttendance[]) => {
    const uniqueMonths = new Set<string>();
    const uniqueYears = new Set<number>();

    data.forEach((record) => {
      uniqueMonths.add(record.month); // Add month name
      uniqueYears.add(record.year); // Add year
    });

    const sortedMonths = Array.from(uniqueMonths).sort(
      (a, b) => new Date(`${a} 1`).getMonth() - new Date(`${b} 1`).getMonth(),
    );
    const sortedYears = Array.from(uniqueYears).sort((a, b) => a - b);

    setMonths(sortedMonths);
    setYears(sortedYears.map(String)); // Convert years to strings for Autocomplete
  };

  useEffect(() => {
    updateMonthsAndYears(SortedAttendanceData);
  }, [SortedAttendanceData]);

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
      "selectedPerRangeYear in handlePerRangeDownloadButtonClick",
      selectedEndYear,
    );
    console.log("handlePerRangeDownloadButtonClick is finish");
  };

  return (
    <div className="flex scale-90 flex-col items-center justify-center pb-[14vw]">
      <h1 className="mb-2 text-[5vw] font-bold max-sm:text-[7vw]">
        Download Attendance
      </h1>
      <div className="m-[3vw] flex w-full flex-col items-center justify-center gap-4 rounded-3xl bg-accent py-[3vw]">
        {/* Download year part */}
        <div className="flex flex-col items-center justify-center gap-2">
          <h2 className="font-bold">Per year:</h2>
          <div className="flex items-center justify-center gap-2">
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
                <AutocompleteItem key={item.value}>
                  {item.label}
                </AutocompleteItem>
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
              onSelectionChange={(key) => setSelectedStartMonth(key as string)}
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
              onSelectionChange={(key) => setSelectedStartYear(key as string)}
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
              onSelectionChange={(key) => setSelectedEndMonth(key as string)}
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
              onSelectionChange={(key) => setSelectedEndYear(key as string)}
            >
              {(item) => (
                <AutocompleteItem key={item.value}>
                  {item.label}
                </AutocompleteItem>
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
        {/* Divider */}
        {/* <div className="h-[0.1vw] w-[60vw] bg-slate-50" /> */}
      </div>
    </div>
  );
};
