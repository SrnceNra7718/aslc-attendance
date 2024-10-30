import { createClient } from "./client";

const supabase = createClient();

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