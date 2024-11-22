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
