"use client";
import { useEffect, useState } from "react";
import { PerRange } from "./components/PerRange"; // Default import
import { PerYear } from "./components/PerYear"; // Default import
import { AttendanceRecord, MonthlyAttendance } from "../types/attendanceTypes";
import {
  fetchLatestAttendance,
  subscribeToAttendanceChanges,
} from "@/utils/supabase/database";
import { sortingMonthlyAttendanceData } from "./functions/DownloadAttendanceUtils";

export const DownloadAttendancePage = () => {
  const [attendanceData, setAttendanceData] = useState<AttendanceRecord[]>([]);
  const [SortedAttendanceData, setSortedAttendanceData] = useState<
    MonthlyAttendance[]
  >([]);

  const [months, setMonths] = useState<string[]>([]);
  const [years, setYears] = useState<string[]>([]);

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
    const fetchData = async (): Promise<void> => {
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

  return (
    <div className="flex scale-90 flex-col items-center justify-center pb-[14vw]">
      <h1 className="mb-2 text-[5vw] font-bold max-sm:text-[7vw]">
        Download Attendance
      </h1>
      <div className="m-[3vw] flex w-full flex-col items-center justify-center gap-4 rounded-3xl bg-accent py-[3vw]">
        <PerYear months={months} years={years} />
        {/* Divider */}
        <div className="h-[0.1vw] w-[60vw] bg-slate-50" />

        <PerRange months={months} years={years} />
      </div>
    </div>
  );
};
