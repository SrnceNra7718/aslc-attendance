"use client";
import {
  checkExistingAttendance,
  insertAttendance,
  updateAttendance,
} from "@/utils/supabase/database";
import { useState, useEffect } from "react";
import CustomButton from "./ui/CustomButton";

export default function AttendanceForm() {
  // State variables for the input values, allowing null as a valid type
  const [dValue, setDValue] = useState<number | null>(0);
  const [hValue, setHValue] = useState<number | null>(0);

  const [originalDValue, setOriginalDValue] = useState<number | null>(0);
  const [originalHValue, setOriginalHValue] = useState<number | null>(0);

  const [existingAttendance, setExistingAttendance] = useState<any>(null); // To store the fetched attendance record

  // State to hold the meeting type and formatted date
  const [meetingInfo, setMeetingInfo] = useState<string>("");
  const [meetingType, setMeetingType] = useState<string>("");
  const [nextMeetingDate, setNextMeetingDate] = useState<string>(""); // State to store the next meeting date

  // Function to handle the sum
  const totalValue = (dValue || 0) + (hValue || 0); // Default to 0 if either value is null

  // Get the current date (you can replace this line with actual current date logic)
  const today = new Date("January 13, 2024 23:15:30"); // Example date "November 2, 2024 23:15:30"
  console.log("today = " + today);

  const currentDay = today.getDay(); // Get the current day of the week (0 = Sunday, 1 = Monday, ..., 6 = Saturday)
  console.log(today.getDay());

  // State to track hover status
  const [isHovered, setIsHovered] = useState(false);

  const [isEditable, setIsEditable] = useState(false); // New state for enabling/disabling inputs

  useEffect(() => {
    // Function to calculate the next Wednesday or Saturday date
    const getNextMeetingDate = (targetDay: number) => {
      const daysUntilTarget = (targetDay + 7 - currentDay) % 7 || 7;
      console.log("targetDay = " + targetDay);
      console.log("daysUntilTarget = " + daysUntilTarget);

      const nextMeetingDate = new Date(today);
      nextMeetingDate.setDate(today.getDate() + daysUntilTarget);
      console.log("nextMeetingDate = " + nextMeetingDate);

      return nextMeetingDate;
    };

    // Function to get the formatted date
    const formatDate = (date: Date) => {
      const month = date.toLocaleString("default", { month: "long" });
      const day = date.getDate();
      const year = date.getFullYear();
      return `– ${month} ${day}, ${year}`;
    };

    // Function to determine the meeting info
    const getMeetingInfo = () => {
      let nextMeetingDate;
      let type = "";

      // Check if today is Wednesday or Saturday
      if (currentDay === 3) {
        // Today is Wednesday
        type = "Midweek";
        nextMeetingDate = today; // Use today's date
      } else if (currentDay === 6) {
        // Today is Saturday
        type = "Weekend";
        nextMeetingDate = today; // Use today's date
      } else if (currentDay >= 1 && currentDay <= 5) {
        // If today is Monday to Friday, find the next Wednesday
        type = "Midweek";
        nextMeetingDate = getNextMeetingDate(3); // 3 = Wednesday
      } else {
        // If today is Sunday, find the next Saturday
        type = "Weekend";
        nextMeetingDate = getNextMeetingDate(6); // 6 = Saturday
      }

      const formattedDate = formatDate(nextMeetingDate);
      const numFormDate = formatDateMMDDYYYY(nextMeetingDate);

      // Update the state with the meeting type and formatted date
      setMeetingType(type);
      setMeetingInfo(`${type} Meeting ${formattedDate}`);
      setNextMeetingDate(numFormDate); // Save the next meeting date
    };

    // Call the function on component mount
    getMeetingInfo();
  }, [currentDay, today]);

  useEffect(() => {
    const fetchAttendance = async () => {
      if (nextMeetingDate) {
        const attendance = await checkExistingAttendance(nextMeetingDate);
        if (attendance && attendance.length > 0) {
          const { hearing, deaf } = attendance[0];
          setDValue(deaf);
          setHValue(hearing);
          setOriginalDValue(deaf);
          setOriginalHValue(hearing);
        } else {
          // No existing attendance, set values to 0
          setDValue(0);
          setHValue(0);
          setOriginalDValue(0);
          setOriginalHValue(0);
        }
        setExistingAttendance(attendance);
      }
    };

    fetchAttendance();
  }, [nextMeetingDate]);

  // Function to handle input change and prevent negative values
  const handleInputChange =
    (setValue: (value: number | null) => void) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;

      // If the input is empty, set the value to null
      if (value === "") {
        setValue(null);
      } else {
        const numberValue = Number(value);

        // Only allow non-negative numbers
        if (numberValue >= 0) {
          setValue(numberValue);
        }
      }
    };

  // Function to format the date as mm_dd_yyyy
  const formatDateMMDDYYYY = (date: Date) => {
    const month = String(date.getMonth() + 1).padStart(2, "0"); // Get the month (0-based, so add 1)
    const day = String(date.getDate()).padStart(2, "0"); // Get the day
    const year = date.getFullYear(); // Get the year
    return `${month}_${day}_${year}`; // Return as mm_dd_yyyy
  };

  // Function to handle submission and alert the values
  const handleSubmit = async () => {
    const formattedDate = nextMeetingDate; // Use nextMeetingDate
    const hearing = hValue || 0; // Assign hValue to hearing
    const deaf = dValue || 0; // Assign dValue to deaf
    const total = totalValue;

    // Validate that the values have changed compared to the original values
    const hasChanges =
      hearing !== originalHValue || // Check if hearing count has changed
      deaf !== originalDValue; // Check if deaf count has changed

    // If no changes detected, log and abort submission
    if (!hasChanges) {
      console.log("No changes detected. Submission aborted.");
      return; // Abort submission if no changes
    }

    // Check if the attendance for this date already exists
    if (existingAttendance === null) {
      console.error("Error checking for existing attendance.");
      return;
    }

    if (existingAttendance.length === 0) {
      // Insert new record if it doesn't exist
      await insertAttendance(formattedDate, hearing, deaf, total, meetingType);
    } else {
      // Update existing record if it exists
      await updateAttendance(formattedDate, hearing, deaf, total, meetingType);
    }

    // Update original values after submission
    setOriginalDValue(deaf);
    setOriginalHValue(hearing);
    setIsEditable(false); // Exit edit mode after submission
  };

  // Function to handle canceling the edit and revert the values
  const handleCancel = () => {
    setIsHovered(true);
    setDValue(originalDValue); // Revert to original D value
    setHValue(originalHValue); // Revert to original H value
    setIsEditable(false); // Disable editing
  };

  return (
    <div
      className="container"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => setIsHovered(true)}
    >
      <div
        id="AttendanceForm"
        className="flex aspect-[16/9] max-h-[90vw] w-screen max-w-[100vw] flex-col items-center justify-center border-[1px] border-foreground bg-card p-6 text-foreground"
      >
        <div>
          <h1 className="text-size flex items-center justify-center text-[6vw] font-extrabold">
            Attendance
          </h1>
          <h3 className="-mt-2 flex w-full items-center justify-center text-[4vw] font-medium">
            {meetingInfo}
          </h3>
        </div>
        <div className="-m-2 flex flex-col items-center justify-center py-3 text-[7vw]">
          {/* Input for D */}
          <div className="-m-2 flex flex-row pl-[10vw]">
            <h2 className="-my-2 flex items-center">D = </h2>
            <input
              type="number"
              value={dValue ?? ""} // Show empty input when value is null
              onChange={handleInputChange(setDValue)}
              className="ml-5 w-[16vw] appearance-none border-gray-300 bg-transparent outline-none focus:outline-none"
              min="0"
              disabled={!isEditable} // Disable input if not editable
            />
          </div>
          {/* Input for H */}
          <div className="flex flex-row pl-[10vw] pt-3">
            <h2 className="flex items-center">H = </h2>
            <input
              type="number"
              value={hValue ?? ""} // Show empty input when value is null
              onChange={handleInputChange(setHValue)}
              className="ml-5 w-[16vw] appearance-none border-gray-300 bg-transparent outline-none focus:outline-none"
              min="0"
              disabled={!isEditable} // Disable input if not editable
            />
          </div>
          <span className="h-1 w-[60vw] items-center bg-foreground" />
          {/* Total display aligned to the right */}
          <div className="-m-2 -ml-[12vw] flex w-full flex-row items-center justify-center py-3 pl-[10vw]">
            <h2>Total = </h2>
            <h2 className="ml-5 w-[16vw]">{totalValue}</h2>
          </div>
        </div>
        {/* Conditional rendering of the buttons */}
        <div className="absolute right-2 top-20 flex gap-2">
          {/* Only show Edit button when not editing */}
          {isHovered && !isEditable && (
            <CustomButton
              iconType="pencil"
              title="Edit"
              onClick={() => setIsEditable(!isEditable)}
            />
          )}

          {/* Show Save and Cancel buttons when editing */}
          {isEditable && (
            <>
              <CustomButton
                iconType="ban"
                title="Cancel"
                onClick={handleCancel}
              />
              <CustomButton
                iconType="save"
                title="Save"
                onClick={handleSubmit}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
}

////
