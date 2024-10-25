"use client";
import { useState } from "react";

export default function Header() {
  // State variables for the input values
  const [dValue, setDValue] = useState<number>(0);
  const [hValue, setHValue] = useState<number>(0);

  // Function to handle the sum
  const totalValue = dValue + hValue;

  return (
    <div className="flex flex-col border">
      <div className="flex h-[397px] w-[720px] flex-col items-center justify-center border-[1px] border-foreground bg-card py-6 text-foreground">
        <div>
          <h1 className="text-size flex w-full items-center justify-center text-5xl font-extrabold">
            Attendance
          </h1>
          <h3 className="flex w-full items-center justify-center pt-2 text-3xl font-medium">
            Midweek Meeting – July 10, 2024
          </h3>
        </div>
        <div className="flex flex-col items-center justify-center py-3 text-5xl">
          {/* Input for D */}
          <div className="flex flex-row">
            <h2 className="flex items-center justify-center">D = </h2>
            <input
              type="number"
              value={dValue}
              onChange={(e) => setDValue(Number(e.target.value))}
              className="ml-2 w-24 appearance-none border-gray-300 bg-transparent text-center outline-none focus:outline-none"
            />
          </div>
          {/* Input for H */}
          <div className="flex flex-row pt-3">
            <h2 className="flex items-center justify-center">H = </h2>
            <input
              type="number"
              value={hValue}
              onChange={(e) => setHValue(Number(e.target.value))}
              className="ml-2 w-24 appearance-none border-gray-300 bg-transparent text-center outline-none focus:outline-none"
            />
          </div>
        </div>
        <span className="h-1 w-[80%] items-center bg-foreground" />
        {/* Total display */}
        <div className="flex flex-row items-start justify-start py-3 text-5xl">
          <h2 className="pr-10">Total = </h2>
          <h2 className="">{totalValue}</h2>
        </div>
      </div>
    </div>
  );
}
