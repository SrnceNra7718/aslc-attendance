import React from "react";

interface TotalDisplayProps {
  value: number;
}

const TotalDisplay: React.FC<TotalDisplayProps> = ({ value }) => (
  <div className="-m-2 -ml-[10vw] flex w-full flex-row items-center justify-center py-3 pl-[10vw]">
    <h2>Total = </h2>
    <h2 className="ml-5 flex w-[16vw] justify-start">{value}</h2>
  </div>
);

export default TotalDisplay;
