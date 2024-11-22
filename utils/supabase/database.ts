import { AttendanceRecord } from "@/app/components/types/attendanceTypes";
import { createClient } from "./client";

const supabase = createClient();

export const fetchLatestAttendance = async () => {
  try {
    const { data: attendance, error } = await supabase
      .from("attendance")
      .select("*")
      .order("date_mm_dd_yyyy", { ascending: true }); // Order by date ascending

    if (error) {
      console.error("Error fetching latest attendance:", error);
      return [];
    }
    return attendance || []; // Return attendance data or an empty array
  } catch (err) {
    console.error("Unexpected error:", err);
    return []; // Return an empty array on error
  }
};

/**
 * Check if attendance exists for the given date.
 * @param formattedDate The date in mm_dd_yyyy format to check.
 * @returns The existing attendance data if found, otherwise null.
 */
export const checkExistingAttendance = async (formattedDate: string) => {
  const { data, error } = await supabase
    .from("attendance")
    .select("*")
    .eq("date_mm_dd_yyyy", formattedDate);

  if (error) {
    console.error("Check Existing Error: ", error.message);
    return null;
  }

  return data;
};

// Function to subscribe to attendance table changes and get all data
export const subscribeToAttendanceChanges = (
  callback: (updatedData: AttendanceRecord[]) => void,
) => {
  const attendanceChannel = supabase
    .channel("custom-attendance-channel")
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "attendance" },
      async (payload) => {
        console.log("Change received!", payload); // Log the payload (or use it in your application logic)

        try {
          // Fetch all data from the "attendance" table after any change occurs
          const { data, error } = await supabase
            .from("attendance")
            .select("*")
            .order("date_mm_dd_yyyy", { ascending: true });

          if (error) {
            console.error("Error fetching updated attendance data:", error);
            return;
          }

          // Ensure data conforms to the AttendanceRecord type
          const typedData = data as AttendanceRecord[];

          // Pass the updated data to the callback
          callback(typedData);
        } catch (err) {
          console.error("Error handling database changes:", err);
        }
      },
    )
    .subscribe();

  // Return a cleanup function to unsubscribe from the channel
  return () => {
    attendanceChannel.unsubscribe();
  };
};

/**
 * Insert a new attendance record.
 * @param formattedDate The formatted date (mm_dd_yyyy).
 * @param hearing The number of hearing attendees.
 * @param deaf The number of deaf attendees.
 * @param total The total attendees.
 * @param meetingType The type of meeting (Midweek or Weekend).
 */
export const insertAttendance = async (
  formattedDate: string,
  hearing: number,
  deaf: number,
  total: number,
  meetingType: string,
) => {
  const { error } = await supabase.from("attendance").insert([
    {
      date_mm_dd_yyyy: formattedDate,
      hearing: hearing,
      deaf: deaf,
      total: total,
      meeting_type: meetingType,
    },
  ]);

  if (error) {
    console.error("Insert Error: ", error.message);
  }
};

/**
 * Update an existing attendance record.
 * @param formattedDate The formatted date (mm_dd_yyyy).
 * @param hearing The number of hearing attendees.
 * @param deaf The number of deaf attendees.
 * @param total The total attendees.
 * @param meetingType The type of meeting (Midweek or Weekend).
 */
export const updateAttendance = async (
  formattedDate: string,
  hearing: number,
  deaf: number,
  total: number,
  meetingType: string,
) => {
  const { error } = await supabase
    .from("attendance")
    .update({
      hearing: hearing,
      deaf: deaf,
      total: total,
      meeting_type: meetingType,
    })
    .eq("date_mm_dd_yyyy", formattedDate);

  if (error) {
    console.error("Update Error: ", error.message);
  }
};

/**
 * Delete an existing attendance record.
 * @param formattedDate The formatted date (mm_dd_yyyy) of the record to delete.
 * @returns A boolean indicating success (true) or failure (false) of the deletion.
 */
export const deleteAttendance = async (formattedDate: string) => {
  const { error } = await supabase
    .from("attendance")
    .delete() // Perform delete operation
    .eq("date_mm_dd_yyyy", formattedDate); // Target the specific date

  if (error) {
    console.error("Delete Error: ", error.message);
    return false; // Return false if deletion fails
  }

  return true; // Return true if deletion succeeds
};

/***************** For Reports ****************** */
/**
 * Fetch all report data ordered by month_year.
 */
export const fetchReports = async () => {
  try {
    const { data: report, error } = await supabase
      .from("report")
      .select("*")
      .order("month_year", { ascending: true }); // Order by month_year ascending

    if (error) {
      console.error("Error fetching reports:", error);
      return [];
    }
    return report || []; // Return reports data or an empty array
  } catch (err) {
    console.error("Unexpected error:", err);
    return []; // Return an empty array on error
  }
};

/**
 * Insert a new report record.
 * @param monthYear Unique identifier for the report in the format "month_year".
 * @param midweekCount Number of midweek meetings.
 * @param midweekTotal Total attendance for midweek meetings.
 * @param midweekAverage Average attendance for midweek meetings.
 * @param midweekDeafTotal Total deaf attendance for midweek meetings.
 * @param midweekDeafAverage Average deaf attendance for midweek meetings.
 * @param weekendCount Number of weekend meetings.
 * @param weekendTotal Total attendance for weekend meetings.
 * @param weekendAverage Average attendance for weekend meetings.
 * @param weekendDeafTotal Total deaf attendance for weekend meetings.
 * @param weekendDeafAverage Average deaf attendance for weekend meetings.
 */
export const insertReport = async (
  monthYear: string,
  midweekCount: number,
  midweekTotal: number,
  midweekAverage: number,
  midweekDeafTotal: number,
  midweekDeafAverage: number,
  weekendCount: number,
  weekendTotal: number,
  weekendAverage: number,
  weekendDeafTotal: number,
  weekendDeafAverage: number,
) => {
  const { error } = await supabase.from("report").insert([
    {
      month_year: monthYear,
      midweek_count: midweekCount,
      midweek_total: midweekTotal,
      midweek_average: midweekAverage,
      midweek_deaf_total: midweekDeafTotal,
      midweek_deaf_average: midweekDeafAverage,
      weekend_count: weekendCount,
      weekend_total: weekendTotal,
      weekend_average: weekendAverage,
      weekend_deaf_total: weekendDeafTotal,
      weekend_deaf_average: weekendDeafAverage,
    },
  ]);

  if (error) {
    console.error("Insert Error:", error.message);
  }
};

/**
 * Update a report in the database based on month_year.
 * @param monthYear The month_year identifier (e.g., "January_2024").
 * @param midWeekData Midweek report data.
 * @param weekendData Weekend report data.
 */
export const updateReport = async (
  monthYear: string,
  midWeekData: {
    count: number;
    total: number;
    average: number;
    deafTotal: number;
    deafAverage: number;
  },
  weekendData: {
    count: number;
    total: number;
    average: number;
    deafTotal: number;
    deafAverage: number;
  },
) => {
  try {
    const { error } = await supabase
      .from("report") // Update the "reports" table
      .update({
        midweek_count: midWeekData.count,
        midweek_total: midWeekData.total,
        midweek_average: midWeekData.average,
        midweek_deaf_total: midWeekData.deafTotal,
        midweek_deaf_average: midWeekData.deafAverage,
        weekend_count: weekendData.count,
        weekend_total: weekendData.total,
        weekend_average: weekendData.average,
        weekend_deaf_total: weekendData.deafTotal,
        weekend_deaf_average: weekendData.deafAverage,
      })
      .eq("month_year", monthYear); // Identify the row to update using the month_year column

    if (error) {
      console.error("Update Report Error:", error.message);
    }
  } catch (err) {
    console.error("Unexpected Error in updateReport:", err);
  }
};

/**
 * Subscribe to changes in the report table.
 * @param callback A function to handle updated report data.
 */
export const subscribeToReportChanges = (
  callback: (updatedData: any[]) => void,
) => {
  const reportChannel = supabase
    .channel("custom-report-channel")
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "report" },
      async (payload) => {
        console.log("Change received!", payload); // Log the payload for debugging

        try {
          // Fetch all updated data from the "report" table
          const { data, error } = await supabase
            .from("report")
            .select("*")
            .order("month_year", { ascending: true });

          if (error) {
            console.error("Error fetching updated report data:", error);
            return;
          }

          // Pass the updated data to the callback
          callback(data || []);
        } catch (err) {
          console.error("Error handling report table changes:", err);
        }
      },
    )
    .subscribe();

  // Return a cleanup function to unsubscribe from the channel
  return () => {
    reportChannel.unsubscribe();
  };
};
