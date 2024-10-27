"use client";
import { useState, useEffect } from "react";

export default function AttendanceForm() {
  // State variables for the input values, allowing null as a valid type
  const [dValue, setDValue] = useState<number | null>(0);
  const [hValue, setHValue] = useState<number | null>(0);

  // State to hold the meeting type and formatted date
  const [meetingInfo, setMeetingInfo] = useState<string>("");

  // Get the current date (you can replace this line with actual current date logic)
  const today = new Date(); // Example date
  console.log("today = " + today);

  const currentDay = today.getDay(); // Get the current day of the week (0 = Sunday, 1 = Monday, ..., 6 = Saturday)
  console.log(today.getDay());

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
      let meetingType = "";

      // Check if today is Wednesday or Saturday
      if (currentDay === 3) {
        // Today is Wednesday
        meetingType = "Midweek Meeting";
        nextMeetingDate = today; // Use today's date
      } else if (currentDay === 6) {
        // Today is Saturday
        meetingType = "Weekend Meeting";
        nextMeetingDate = today; // Use today's date
      } else if (currentDay >= 1 && currentDay <= 5) {
        // If today is Monday to Friday, find the next Wednesday
        meetingType = "Midweek Meeting";
        nextMeetingDate = getNextMeetingDate(3); // 3 = Wednesday
      } else {
        // If today is Sunday, find the next Saturday
        meetingType = "Weekend Meeting";
        nextMeetingDate = getNextMeetingDate(6); // 6 = Saturday
      }

      const formattedDate = formatDate(nextMeetingDate);

      // Update the state with the meeting type and formatted date
      setMeetingInfo(`${meetingType} ${formattedDate}`);
    };

    // Call the function on component mount
    getMeetingInfo();
  }, [currentDay, today]);

  // Function to handle the sum
  const totalValue = (dValue || 0) + (hValue || 0); // Default to 0 if either value is null

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

  return (
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
          {/* This will display the next "Midweek Meeting (Wednesday)" or "Weekend Meeting (Saturday)" with the correct date */}
        </h3>
      </div>
      <div className="-m-2 flex flex-col items-center justify-center py-3 text-[7vw]">
        {/* Input for D */}
        <div className="-m-2 flex flex-row pl-5">
          <h2 className="-my-2 flex items-center">D = </h2>
          <input
            type="number"
            value={dValue ?? ""} // Show empty input when value is null
            onChange={handleInputChange(setDValue)}
            className="ml-5 w-[16vw] appearance-none border-gray-300 bg-transparent outline-none focus:outline-none"
            min="0"
          />
        </div>
        {/* Input for H */}
        <div className="flex flex-row pl-5 pt-3">
          <h2 className="flex items-center">H = </h2>
          <input
            type="number"
            value={hValue ?? ""} // Show empty input when value is null
            onChange={handleInputChange(setHValue)}
            className="ml-5 w-[16vw] appearance-none border-gray-300 bg-transparent outline-none focus:outline-none"
            min="0"
          />
        </div>
        <span className="h-1 w-[60vw] items-center bg-foreground" />
        {/* Total display aligned to the right */}
        <div className="-m-2 -ml-[12vw] flex w-full flex-row items-center justify-center py-3 pl-5">
          <h2>Total = </h2>
          <h2 className="ml-5 w-[16vw]">{totalValue}</h2>
        </div>
      </div>
    </div>
  );
}
