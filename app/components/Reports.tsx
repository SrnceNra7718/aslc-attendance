import React from "react";
import { MonthlyAttendance } from "./types/attendanceTypes";
import {
  calculateAverage,
  calculateDeafAverage,
} from "./functions/attendanceUtils";

interface ReportsProps {
  monthlyAttendance: Record<string, MonthlyAttendance>;
  monthlyTotals: Record<string, { midWeekTotal: number; weekendTotal: number }>;
  monthlyDeafTotals: Record<
    string,
    { midWeekDeafTotal: number; weekendDeafTotal: number }
  >;
}

export const Reports: React.FC<ReportsProps> = ({
  monthlyAttendance,
  monthlyTotals,
  monthlyDeafTotals,
}) => {
  return (
    <div className="mb-2 w-[85%] font-normal">
      <h3 className="flex items-center justify-center text-[2.5vw] font-bold max-sm:text-[4.5vw]">
        Reports:
      </h3>
      {Object.entries(monthlyAttendance).map(([month, data]) => {
        const { midWeek, weekend } = data;

        const midWeekCount = midWeek.length;
        const weekendCount = weekend.length;

        const midWeekTotal = monthlyTotals[month]?.midWeekTotal || 0;
        const weekendTotal = monthlyTotals[month]?.weekendTotal || 0;

        const midWeekDeafTotal =
          monthlyDeafTotals[month]?.midWeekDeafTotal || 0;
        const weekendDeafTotal =
          monthlyDeafTotals[month]?.weekendDeafTotal || 0;

        const midWeekAverage = calculateAverage(midWeekCount, midWeekTotal);
        const weekendAverage = calculateAverage(weekendCount, weekendTotal);

        const midWeekDeafAverage = calculateDeafAverage(
          midWeekCount,
          midWeekDeafTotal,
        );
        const weekendDeafAverage = calculateDeafAverage(
          weekendCount,
          weekendDeafTotal,
        );

        return (
          <div key={month}>
            <div className="flex w-full flex-row items-center justify-center gap-4 text-[0.7rem] md:text-[1.5rem]">
              {/* Midweek Section */}
              <div className="flex w-full flex-col items-start justify-center">
                <div className="flex w-full flex-row justify-between">
                  <span className="font-semibold">Midweek Meetings:</span>
                  <span>{midWeekCount}</span>
                </div>
                <div className="flex w-full flex-row justify-between">
                  <span className="font-semibold">Overall:</span>
                  <span>{midWeekTotal}</span>
                </div>
                <div className="flex w-full flex-row justify-between">
                  <span className="font-semibold">Average:</span>
                  <span>{midWeekAverage}</span>
                </div>

                <div className="flex w-full flex-row justify-between">
                  <span className="font-semibold">Overall Deaf:</span>
                  <span>{midWeekDeafTotal}</span>
                </div>
                <div className="flex w-full flex-row justify-between">
                  <span className="font-semibold">Deaf Average:</span>
                  <span>{midWeekDeafAverage}</span>
                </div>
              </div>
              {/* Divider */}
              <div className="h-[13vw] w-[0.1vw] bg-slate-50" />
              {/* Weekend Section */}
              <div className="flex w-full flex-col items-start justify-center">
                <div className="flex w-full flex-row justify-between">
                  <span className="font-semibold">Weekend Meetings:</span>
                  <span>{weekendCount}</span>
                </div>
                <div className="flex w-full flex-row justify-between">
                  <span className="font-semibold">Overall:</span>
                  <span>{weekendTotal}</span>
                </div>
                <div className="flex w-full flex-row justify-between">
                  <span className="font-semibold">Average:</span>
                  <span>{weekendAverage}</span>
                </div>

                <div className="flex w-full flex-row justify-between">
                  <span className="font-semibold">Overall Deaf:</span>
                  <span>{weekendDeafTotal}</span>
                </div>
                <div className="flex w-full flex-row justify-between">
                  <span className="font-semibold">Deaf Average:</span>
                  <span>{weekendDeafAverage}</span>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
