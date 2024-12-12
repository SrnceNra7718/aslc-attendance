"use client";
import {
  checkExistingAttendance,
  insertAttendance,
  subscribeToAttendanceChanges,
  updateAttendance,
} from "@/utils/supabase/database";
import { useState, useEffect } from "react";
import CustomButton from "./ui/CustomButton";
import LogDisplay from "./ui/LogDisplay";
import { CircleMinus, CirclePlus } from "lucide-react";
import { Button } from "@nextui-org/react";

export default function AttendanceForm() {
  // State variables for the input values, allowing null as a valid type
  const [inputDate, setInputDate] = useState<string>("");

  const [dValue, setDValue] = useState<number | null>(null);
  const [hValue, setHValue] = useState<number | null>(null);

  const [originalDValue, setOriginalDValue] = useState<number | null>(0);
  const [originalHValue, setOriginalHValue] = useState<number | null>(0);

  const [existingAttendance, setExistingAttendance] = useState<any>(null); // To store the fetched attendance record

  // State to hold the meeting type and formatted date
  const [meetingInfo, setMeetingInfo] = useState<string>("");
  const [meetingInfoPL, setMeetingInfoPL] = useState<string>("");
  const [meetingType, setMeetingType] = useState<string>("");
  const [nextMeetingDate, setNextMeetingDate] = useState<string>(""); // State to store the next meeting date

  // Function to handle the sum
  const totalValue = (dValue || 0) + (hValue || 0); // Default to 0 if either value is null

  const today = inputDate ? new Date(`${inputDate} 23:15:30`) : new Date(); // Example date "November 2, 2024 23:15:30"

  const currentDay = today.getDay(); // Get the current day of the week (0 = Sunday, 1 = Monday, ..., 7 = Sunday)

  // State to track hover status
  const [isHovered, setIsHovered] = useState(false);

  const [isEditable, setIsEditable] = useState(false); // New state for enabling/disabling inputs

  const [logMessage, setLogMessage] = useState<string>(""); // State for the log message
  const [isSaveClicked, setIsSaveClicked] = useState<boolean>(false); // New state

  useEffect(() => {
    // Function to calculate the next meeting date
    const getNextMeetingDate = (targetDay: number) => {
      const daysUntilTarget = (targetDay + 7 - currentDay) % 7 || 7;

      const nextMeetingDate = new Date(today);
      nextMeetingDate.setDate(today.getDate() + daysUntilTarget);

      return nextMeetingDate;
    };

    // Function to get the formatted date
    const formatDate = (date: Date) => {
      const month = date.toLocaleString("default", { month: "long" });
      const day = String(date.getDate()).padStart(2, "0"); // Pad single-digit days with '0'
      const year = date.getFullYear();
      return `${month} ${day}, ${year}`;
    };

    // Function to determine the meeting info
    const getMeetingInfo = () => {
      let nextMeetingDate;
      let type = "";

      if (currentDay === 3) {
        // Today is Wednesday
        type = "Midweek";
        nextMeetingDate = today;
      } else if (currentDay === 0) {
        // Today is Sunday
        type = "Weekend";
        nextMeetingDate = today;
      } else if (currentDay === 1 || currentDay === 2) {
        // If today is Monday or Tuesday, find the next Wednesday
        type = "Midweek";
        nextMeetingDate = getNextMeetingDate(3); // 3 = Wednesday
      } else {
        // If today is Thursday, Friday, or Saturday, find the next Sunday
        type = "Weekend";
        nextMeetingDate = getNextMeetingDate(0); // 0 = Sunday
      }

      const formattedDate = formatDate(nextMeetingDate);

      // Update the state with the meeting type and formatted date
      setMeetingType(type);
      setMeetingInfo(`${type} Meeting – ${formattedDate}`);
      setMeetingInfoPL(formattedDate);
      setNextMeetingDate(formattedDate); // Save the next meeting date
    };

    // Call the function on component mount
    getMeetingInfo();
  }, [currentDay, today]);

  // Fetch and subscribe to attendance updates
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
          setDValue(null);
          setHValue(null);
          setOriginalDValue(null);
          setOriginalHValue(null);
        }
        setExistingAttendance(attendance);
      }
    };

    // Subscribe to attendance changes
    const unsubscribe = subscribeToAttendanceChanges((updatedData) => {
      const updatedRecord = updatedData.find(
        (record) => record.date_mm_dd_yyyy === nextMeetingDate,
      );

      if (updatedRecord) {
        const { hearing, deaf } = updatedRecord;
        setDValue(deaf);
        setHValue(hearing);
        setOriginalDValue(deaf);
        setOriginalHValue(hearing);
        setExistingAttendance([updatedRecord]);
      } else {
        setDValue(null);
        setHValue(null);
        setOriginalDValue(null);
        setOriginalHValue(null);
        setExistingAttendance([]);
      }
      setLogMessage("Recieved updated attendance count");
      setIsSaveClicked(true); // Show LogDisplay
      setTimeout(() => setIsSaveClicked(false), 1000); // Reset
    });
    fetchAttendance();

    return () => {
      unsubscribe();
    };
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
        // Remove any initial zeroes if the user is typing a new number
        const sanitizedValue = value.replace(/^0+/, "") || "0";
        const numberValue = Number(sanitizedValue);

        // Only allow non-negative numbers
        if (numberValue >= 0) {
          setValue(numberValue);
        } else {
          setValue(0);
        }
      }
    };

  // Function to handle submission and alert the values
  const handleSubmit = async () => {
    const formattedDate = nextMeetingDate; // Use nextMeetingDate
    const hearing = hValue || 0; // Assign hValue to hearing
    const deaf = dValue || 0; // Assign dValue to deaf
    const total = totalValue;

    // Validate that the values have changed compared to the original values
    const hasChanges = hearing !== originalHValue || deaf !== originalDValue;

    // If no changes detected, log and abort submission
    if (!hasChanges) {
      console.log("No changes detected. Submission aborted.");
      setLogMessage("No changes detected. Submission aborted."); // Log message
      setIsSaveClicked(true); // Show LogDisplay
      setTimeout(() => setIsSaveClicked(false), 1000); // Reset save button click state after rendering

      return; // Abort submission if no changes
    }

    // Check if attendance for this date already exists
    if (existingAttendance === null) {
      console.error("Error checking for existing attendance.");
      setLogMessage("Error checking for existing attendance."); // Log error message

      return;
    }

    // Determine if there's an existing record with the same date
    const existingRecord = existingAttendance.find(
      (record: { date_mm_dd_yyyy: string }) =>
        record.date_mm_dd_yyyy === formattedDate,
    );

    try {
      if (existingRecord) {
        // Update existing record if date matches
        await updateAttendance(
          formattedDate,
          hearing,
          deaf,
          total,
          meetingType,
        );
        setLogMessage("Attendance updated successfully."); // Log update message
        setIsSaveClicked(true); // Show LogDisplay
        setTimeout(() => setIsSaveClicked(false), 1000); // Reset save button click state after rendering

        console.log("Attendance updated successfully.");
      } else {
        // Insert new record if date does not match
        await insertAttendance(
          formattedDate,
          hearing,
          deaf,
          total,
          meetingType,
        );
        setLogMessage("New attendance record inserted successfully."); // Log insert message
        setIsSaveClicked(true); // Show LogDisplay
        setTimeout(() => setIsSaveClicked(false), 1000); // Reset save button click state after rendering

        console.log("New attendance record inserted successfully.");
      }

      // Update original values after submission
      setOriginalDValue(deaf);
      setOriginalHValue(hearing);
      setIsEditable(false); // Exit edit mode after submission
    } catch (error) {
      setLogMessage(`Error during attendance submission: ${error}`); // Log error message
      console.error("Error during attendance submission:", error);
    }
  };

  // Function to handle canceling the edit and revert the values
  const handleCancel = () => {
    setIsHovered(true);
    setDValue(originalDValue); // Revert to original D value
    setHValue(originalHValue); // Revert to original H value
    setIsEditable(false); // Disable editing
  };

  const handleAddHearing = () => {
    // Increment hValue by 1, initializing to 0 if it's null
    setHValue((prev) => (prev !== null ? prev + 1 : 1));
  };

  const handleMinusHearing = () => {
    // Decrement hValue by 1 if it's greater than 0
    setHValue((prev) => (prev !== null && prev > 0 ? prev - 1 : 0));
  };

  const handleAddDeaf = () => {
    // Increment dValue by 1, initializing to 0 if it's null
    setDValue((prev) => (prev !== null ? prev + 1 : 1));
  };

  const handleMinusDeaf = () => {
    // Decrement dValue by 1 if it's greater than 0
    setDValue((prev) => (prev !== null && prev > 0 ? prev - 1 : 0));
  };

  const button_Red_Classes =
    "bg-red-600 p-1 text-xs text-slate-100 max-md:mt-8 max-sm:mt-1 sm:mt-7 sm:p-2 sm:text-sm md:mt-7 lg:mt-9 md:scale-125";
  const button_Blue_Classes =
    "bg-blue-600 p-1 text-xs text-slate-100 max-md:mt-8 max-sm:mt-0 sm:mt-7 sm:p-2 sm:text-sm md:mt-7 lg:mt-9 md:scale-125";

  return (
    <div
      className="flex justify-center text-center"
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
          {/* This conditionally renders either an input field for editable mode or meetingInfo for read-only mode */}
          <h3 className="-mt-2 flex w-full items-center justify-center text-[4vw] font-medium">
            {isEditable ? (
              <input
                type="text"
                value={inputDate} // Display the current input date value.
                onChange={(e) => setInputDate(e.target.value)} // Update state when user types.
                placeholder={meetingInfoPL} // Optional placeholder text.
                className="appearance-none border-gray-300 bg-transparent outline-none focus:outline-none"
              />
            ) : (
              meetingInfo // Display meetingInfo when not in editable mode.
            )}
          </h3>
        </div>
        <div className="-m-2 flex flex-col items-center justify-center py-3 text-[7vw]">
          {/* Input for D */}
          <div className="-m-2 flex flex-row pl-[10vw]">
            {isEditable && (
              <Button
                size="sm"
                color="danger"
                variant="solid"
                onClick={handleMinusDeaf}
                className={button_Red_Classes}
              >
                <CircleMinus size={17} />
              </Button>
            )}
            <h2 className="-my-2 ml-4 flex items-center">D = </h2>
            <input
              id="dValue"
              type="number"
              value={dValue ?? ""} // Show empty input when value is null
              onChange={handleInputChange(setDValue)}
              className="ml-5 w-[16vw] appearance-none border-gray-300 bg-transparent outline-none focus:outline-none"
              min="0"
              disabled={!isEditable} // Disable input if not editable
              placeholder="0"
            />
            {isEditable && (
              <Button
                size="sm"
                color="primary"
                variant="solid"
                onClick={handleAddDeaf}
                className={`${button_Blue_Classes} max-sm:mt-1`}
              >
                <CirclePlus size={17} />
              </Button>
            )}
          </div>

          {/* Input for H */}
          <div className="flex flex-row pl-[10vw] pt-3">
            {isEditable && (
              <Button
                size="sm"
                color="danger"
                variant="solid"
                onClick={handleMinusHearing}
                className={`${button_Red_Classes} max-sm:mt-0`}
              >
                <CircleMinus size={17} />
              </Button>
            )}
            <h2 className="ml-4 flex items-center">H = </h2>
            <input
              id="hValue"
              type="number"
              value={hValue ?? ""} // Show empty input when value is null
              onChange={handleInputChange(setHValue)}
              className="ml-5 w-[16vw] appearance-none border-gray-300 bg-transparent outline-none focus:outline-none"
              min="0"
              disabled={!isEditable} // Disable input if not editable
              placeholder="0"
            />
            {isEditable && (
              <Button
                size="sm"
                color="primary"
                variant="solid"
                onClick={handleAddHearing}
                className={button_Blue_Classes}
              >
                <CirclePlus size={17} />
              </Button>
            )}
          </div>
          <span className="h-1 w-[60vw] items-center bg-foreground" />
          {/* Total display aligned to the right */}
          <div className="-m-2 -ml-[10vw] flex w-full flex-row items-center justify-center py-3 pl-[10vw]">
            <h2>Total = </h2>
            <h2 className="ml-5 flex w-[16vw] justify-start">{totalValue}</h2>
          </div>
        </div>
        {/* Conditional rendering of the buttons */}
        <div className="absolute right-0 top-16 flex gap-2 max-sm:top-[4.5rem] sm:right-3 sm:top-20">
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
                className="max-sm:mr-[-1.5rem]"
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
      {logMessage && (
        <LogDisplay message={logMessage} isButtonClicked={isSaveClicked} />
      )}{" "}
      {/* Display LogDisplay with log message */}
    </div>
  );
}
