import { AttendanceRecord } from "../types/attendanceTypes";
import {
  updateAttendance,
  deleteAttendance,
  fetchLatestAttendance,
  subscribeToAttendanceChanges,
} from "@/utils/supabase/database";

// /functions/attendanceUtils.ts
export const getMonthAndYearFromDate = (date: string | undefined): string => {
  if (!date) {
    console.warn("Invalid date input:", date);
    return "Unknown Date";
  }

  const parts = date.split("_");
  if (parts.length !== 3) {
    console.warn("Date format mismatch:", date);
    return "Unknown Date";
  }

  const [month, , year] = parts;

  const monthName = (() => {
    switch (month) {
      case "01":
        return "January";
      case "02":
        return "February";
      case "03":
        return "March";
      case "04":
        return "April";
      case "05":
        return "May";
      case "06":
        return "June";
      case "07":
        return "July";
      case "08":
        return "August";
      case "09":
        return "September";
      case "10":
        return "October";
      case "11":
        return "November";
      case "12":
        return "December";
      default:
        console.warn("Unexpected month value:", month);
        return "Unknown Month";
    }
  })();

  return `${monthName} ${year}`;
};

/*************************** for AttendanceTable.tsx ***********************************/

// New function to calculate averages
export const calculateAverage = (count: number, total: number) => {
  // Avoid division by zero and return 0 when count is 0
  if (count === 0) return 0;

  // Calculate the average and round to the nearest whole number
  return Math.round(total / count);
};

// function to calculate deaf averages
export const calculateDeafAverage = (count: number, deafTotal: number) => {
  // Avoid division by zero and return 0 when count is 0
  if (count === 0) return 0;

  // Calculate the deaf average and round to the nearest whole number
  return Math.round(deafTotal / count);
};

// Function to group attendance data by month and meeting type
export const groupAttendanceByMonth = (attendanceData: AttendanceRecord[]) => {
  return attendanceData.reduce(
    (acc, item) => {
      const month = getMonthAndYearFromDate(
        item.date_mm_dd_yyyy || "Invalid Date",
      );

      const isWeekend =
        item.meeting_type?.toLowerCase().includes("weekend") || false;
      if (!acc[month]) {
        acc[month] = { midWeek: [], weekend: [] };
      }

      if (isWeekend) {
        acc[month].weekend.push(item);
      } else {
        acc[month].midWeek.push(item);
      }

      return acc;
    },
    {} as Record<
      string,
      { midWeek: AttendanceRecord[]; weekend: AttendanceRecord[] }
    >,
  );
};

// Function to count meetings per meeting type for each month
export const countTotalMeetings = (monthData: {
  midWeek: AttendanceRecord[];
  weekend: AttendanceRecord[];
}) => {
  const midWeekCount = monthData.midWeek.length;
  const weekendCount = monthData.weekend.length;

  return { midWeekCount, weekendCount };
};

// Function to count overall deaf only totals per meeting type for each month
export const calculateDeafTotals = (attendanceData: AttendanceRecord[]) => {
  // Initialize an object to hold the totals per meeting type for each month
  const monthlyDeafTotals: {
    [month: string]: { midWeekDeafTotal: number; weekendDeafTotal: number };
  } = {};

  // Loop through the attendance data and group them by month and meeting type
  attendanceData.forEach((record) => {
    const month = getMonthAndYearFromDate(
      record.date_mm_dd_yyyy || "Invalid Date",
    );

    // Initialize the month entry if it doesn't exist
    if (!monthlyDeafTotals[month]) {
      monthlyDeafTotals[month] = { midWeekDeafTotal: 0, weekendDeafTotal: 0 };
    }

    // Calculate the total for each record
    const recordTotal = record.deaf ?? 0;

    // Increment the total based on the meeting type
    if (record.meeting_type?.toLowerCase().includes("midweek")) {
      monthlyDeafTotals[month].midWeekDeafTotal += recordTotal; // Add attendees to midweek total
    } else if (record.meeting_type?.toLowerCase().includes("weekend")) {
      monthlyDeafTotals[month].weekendDeafTotal += recordTotal; // Add attendees to weekend total
    }
  });

  return monthlyDeafTotals;
};

// Function to count overall totals per meeting type for each month
export const calculateOverallTotals = (attendanceData: AttendanceRecord[]) => {
  // Initialize an object to hold the totals per meeting type for each month
  const monthlyTotals: {
    [month: string]: { midWeekTotal: number; weekendTotal: number };
  } = {};

  // Loop through the attendance data and group them by month and meeting type
  attendanceData.forEach((record) => {
    const month = getMonthAndYearFromDate(
      record.date_mm_dd_yyyy || "Invalid Date",
    );

    // Initialize the month entry if it doesn't exist
    if (!monthlyTotals[month]) {
      monthlyTotals[month] = { midWeekTotal: 0, weekendTotal: 0 };
    }

    // Use the total directly from the record
    const recordTotal = record.total ?? 0; // Fallback to 0 if total is undefined

    // Increment the total based on the meeting type
    if (record.meeting_type?.toLowerCase().includes("midweek")) {
      monthlyTotals[month].midWeekTotal += recordTotal; // Add attendees to midweek total
    } else if (record.meeting_type?.toLowerCase().includes("weekend")) {
      monthlyTotals[month].weekendTotal += recordTotal; // Add attendees to weekend total
    }
  });

  return monthlyTotals;
};

// Function to handle attendance update
export const handleAttendanceUpdate = async (
  localEditedData: AttendanceRecord | null,
  attendanceData: AttendanceRecord[],
  setAttendanceData: React.Dispatch<React.SetStateAction<AttendanceRecord[]>>,
  setLogMessage: React.Dispatch<React.SetStateAction<string>>,
  setEditingRow: React.Dispatch<React.SetStateAction<string | null>>,
  setLocalEditedData: React.Dispatch<
    React.SetStateAction<AttendanceRecord | null>
  >,
) => {
  if (localEditedData) {
    const { date_mm_dd_yyyy, hearing, deaf, total, meeting_type } =
      localEditedData;
    const originalData = attendanceData.find(
      (record) => record.date_mm_dd_yyyy === date_mm_dd_yyyy,
    );

    if (!originalData) {
      setLogMessage("Original record not found. Submission aborted.");
      return;
    }

    const hasChanges =
      hearing !== originalData.hearing || deaf !== originalData.deaf;
    if (!hasChanges) {
      setLogMessage("No changes detected. Submission aborted.");
      return;
    }

    try {
      await updateAttendance(
        date_mm_dd_yyyy,
        hearing,
        deaf,
        total,
        meeting_type,
      );
      setAttendanceData((prevData) =>
        prevData.map((item) =>
          item.date_mm_dd_yyyy === date_mm_dd_yyyy
            ? { ...item, hearing, deaf, total }
            : item,
        ),
      );
      setLogMessage("Attendance record updated successfully.");
      setEditingRow(null);
      setLocalEditedData(null);
    } catch (error) {
      setLogMessage(`Error during attendance submission: ${error}`);
    }
  }
};

// Function to handle attendance deletion
export const handleAttendanceDelete = async (
  date_mm_dd_yyyy: string,
  attendanceData: AttendanceRecord[],
  setAttendanceData: React.Dispatch<React.SetStateAction<AttendanceRecord[]>>,
  setLogMessage: React.Dispatch<React.SetStateAction<string>>,
  setEditingRow: React.Dispatch<React.SetStateAction<string | null>>,
  setLocalEditedData: React.Dispatch<
    React.SetStateAction<AttendanceRecord | null>
  >,
  setIsSaveButtonClicked: React.Dispatch<React.SetStateAction<boolean>>,
) => {
  try {
    const recordToDelete = attendanceData.find(
      (record) => record.date_mm_dd_yyyy === date_mm_dd_yyyy,
    );

    if (!recordToDelete) {
      console.error("Record not found for deletion.");
      setLogMessage("Record not found for deletion.");
      setIsSaveButtonClicked(true);
      setTimeout(() => setIsSaveButtonClicked(false), 1000);
      return;
    }

    const isDeleted = await deleteAttendance(date_mm_dd_yyyy);

    if (isDeleted) {
      setAttendanceData((prevData) =>
        prevData.filter((item) => item.date_mm_dd_yyyy !== date_mm_dd_yyyy),
      );
      setLogMessage("Attendance record deleted successfully.");
    } else {
      console.error("Failed to delete attendance record.");
      setLogMessage("Failed to delete attendance record.");
    }
    setIsSaveButtonClicked(true);
    setTimeout(() => setIsSaveButtonClicked(false), 1000);

    setEditingRow(null);
    setLocalEditedData(null);
  } catch (error) {
    setLogMessage(`Error during deletion: ${error}`);
    console.error("Error during deletion:", error);
  }
};

// Function to load the latest attendance data
export const loadLatestAttendanceData = async (
  setAttendanceData: React.Dispatch<React.SetStateAction<AttendanceRecord[]>>,
) => {
  const latestData = await fetchLatestAttendance();
  setAttendanceData(latestData || []);
};

// Function to subscribe to real-time attendance changes
export const subscribeToAttendance = (
  setAttendanceData: React.Dispatch<React.SetStateAction<AttendanceRecord[]>>,
) => {
  const unsubscribe = subscribeToAttendanceChanges(
    (updatedData: AttendanceRecord[]) => {
      setAttendanceData((prevData) => {
        const updatedAttendance = [...prevData];

        updatedData.forEach((record) => {
          const existingRecordIndex = updatedAttendance.findIndex(
            (item) => item.date_mm_dd_yyyy === record.date_mm_dd_yyyy,
          );

          if (existingRecordIndex !== -1) {
            updatedAttendance[existingRecordIndex] = record;
          } else {
            updatedAttendance.push(record);
          }
        });

        return updatedAttendance;
      });
    },
  );

  return unsubscribe;
};
