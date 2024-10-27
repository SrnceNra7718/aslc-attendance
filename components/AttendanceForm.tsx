"use client";
import { useState } from "react";

export default function AttendanceForm() {
  // State variables for the input values, allowing null as a valid type
  const [dValue, setDValue] = useState<number | null>(0);
  const [hValue, setHValue] = useState<number | null>(0);

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
          Midweek Meeting – July 10, 2024
        </h3>
      </div>
      <div className="-m-2 flex flex-col items-center justify-center py-3 text-[7vw]">
        {/* Input for D */}
        <div className="-m-2 flex flex-row">
          <h2 className="-my-2 flex items-center">D = </h2>
          <input
            type="number"
            value={dValue ?? ""} // Show empty input when value is null
            onChange={handleInputChange(setDValue)}
            className="ml-5 w-28 appearance-none border-gray-300 bg-transparent outline-none focus:outline-none"
            min="0"
          />
        </div>
        {/* Input for H */}
        <div className="flex flex-row pt-3">
          <h2 className="flex items-center">H = </h2>
          <input
            type="number"
            value={hValue ?? ""} // Show empty input when value is null
            onChange={handleInputChange(setHValue)}
            className="ml-5 w-28 appearance-none border-gray-300 bg-transparent outline-none focus:outline-none"
            min="0"
          />
        </div>
        <span className="h-1 w-[60vw] items-center bg-foreground" />
        {/* Total display aligned to the right */}
        <div className="-m-2 flex w-full flex-row items-center justify-center py-3">
          <h2>Total = </h2>
          <h2 className="ml-5 w-40">{totalValue}</h2>
        </div>
      </div>
    </div>
  );
}
