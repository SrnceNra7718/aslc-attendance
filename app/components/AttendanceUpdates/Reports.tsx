import React, { useState, useEffect } from "react";
import { MonthlyAttendance } from "../types/attendanceTypes";
import {
  calculateAverage,
  calculateDeafAverage,
} from "../functions/attendanceUtils";
import {
  fetchReports,
  updateReport,
  insertReport,
} from "@/utils/supabase/database";
import LogDisplay from "../ui/LogDisplay";
import ExportReportsButton from "../functions/AttendanceRecord";

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
  const [reportData, setReportData] = useState<any[]>([]);
  const [logMessage, setLogMessage] = useState<string>(""); // State for the log message
  const [isSaveClicked, setIsSaveClicked] = useState<boolean>(false); // New state

  useEffect(() => {
    const processReports = async () => {
      try {
        const allData: any[] = [];
        const existingReports = await fetchReports(); // Fetch existing reports

        if (!monthlyAttendance || Object.keys(monthlyAttendance).length === 0) {
          console.warn("No attendance data available to process.");
          setLogMessage("No attendance data available.");
          return;
        }

        for (const [month, data] of Object.entries(monthlyAttendance)) {
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

          const monthData = {
            month,
            midWeek: {
              count: midWeekCount,
              total: midWeekTotal,
              average: midWeekAverage,
              deafTotal: midWeekDeafTotal,
              deafAverage: midWeekDeafAverage,
            },
            weekend: {
              count: weekendCount,
              total: weekendTotal,
              average: weekendAverage,
              deafTotal: weekendDeafTotal,
              deafAverage: weekendDeafAverage,
            },
          };

          allData.push(monthData);

          // Prepare month_year key for comparison
          const monthYear = `${month}`;

          // Find existing report with the same month_year
          const existingReport = existingReports.find(
            (report) => report.month_year === monthYear,
          );
          if (!existingReport) {
            // Insert new report if it doesn't exist
            console.log(`Inserting report for ${monthYear}`);
            setLogMessage(`Inserting report for ${monthYear}`); // Log insert message
            setIsSaveClicked(true); // Show LogDisplay
            setTimeout(() => setIsSaveClicked(false), 1000); // Reset save button click state after rendering

            await insertReport(
              monthYear,
              midWeekCount,
              midWeekTotal,
              midWeekAverage,
              midWeekDeafTotal,
              midWeekDeafAverage,
              weekendCount,
              weekendTotal,
              weekendAverage,
              weekendDeafTotal,
              weekendDeafAverage,
            );
          } else {
            // Compare existing data with new data
            const hasChanges =
              existingReport.midweek_count !== midWeekCount ||
              existingReport.midweek_total !== midWeekTotal ||
              existingReport.midweek_average !== midWeekAverage ||
              existingReport.midweek_deaf_total !== midWeekDeafTotal ||
              existingReport.midweek_deaf_average !== midWeekDeafAverage ||
              existingReport.weekend_count !== weekendCount ||
              existingReport.weekend_total !== weekendTotal ||
              existingReport.weekend_average !== weekendAverage ||
              existingReport.weekend_deaf_total !== weekendDeafTotal ||
              existingReport.weekend_deaf_average !== weekendDeafAverage;

            if (hasChanges) {
              // Update report if there are changes
              console.log(`Updating report for ${monthYear}`);
              setLogMessage(`Updating report for ${monthYear}`); // Log insert message
              setIsSaveClicked(true); // Show LogDisplay
              setTimeout(() => setIsSaveClicked(false), 1000); // Reset save button click state after rendering

              await updateReport(
                monthYear,
                monthData.midWeek,
                monthData.weekend,
              );
            } else {
              // Nothing change report if it doesn't exist
              console.log(`Nothing change report for ${monthYear}`);
              setLogMessage(`Nothing change report for ${monthYear}`); // Log insert message
              setIsSaveClicked(true); // Show LogDisplay
              setTimeout(() => setIsSaveClicked(false), 1000); // Reset save button click state after rendering
            }
          }
        }

        setReportData(allData.length ? allData : []);
      } catch (error) {
        console.error("Error processing reports:", error);
        setLogMessage("An error occurred while processing reports.");
      }
    };

    processReports();
  }, [monthlyAttendance, monthlyTotals, monthlyDeafTotals]);

  return (
    <div className="mb-2 w-[85%] px-[1rem] font-normal">
      {logMessage && (
        <LogDisplay message={logMessage} isButtonClicked={isSaveClicked} />
      )}
      <h3 className="flex items-center justify-center text-[2.5vw] font-bold max-sm:text-[4.5vw]">
        Reports:
      </h3>
      {reportData.map((data) => (
        <div key={data.month}>
          <div className="flex w-full flex-col items-center justify-center gap-4 text-[1.2rem] md:flex-row md:text-[1.5rem]">
            {/* Midweek Section */}
            <div className="flex w-full flex-col items-start justify-center">
              <div className="flex w-full flex-row justify-between">
                <span className="font-semibold">Midweek Meetings:</span>
                <span>{data.midWeek.count}</span>
              </div>
              <div className="flex w-full flex-row justify-between">
                <span className="font-semibold">Overall:</span>
                <span>{data.midWeek.total}</span>
              </div>
              <div className="flex w-full flex-row justify-between">
                <span className="font-semibold">Average:</span>
                <span>{data.midWeek.average}</span>
              </div>
              <div className="flex w-full flex-row justify-between">
                <span className="font-semibold">Overall Deaf:</span>
                <span>{data.midWeek.deafTotal}</span>
              </div>
              <div className="flex w-full flex-row justify-between">
                <span className="font-semibold">Deaf Average:</span>
                <span>{data.midWeek.deafAverage}</span>
              </div>
            </div>
            {/* Divider */}
            <div className="hidden h-[13vw] w-[0.1vw] bg-slate-50 md:block" />
            <div className="block h-[0.1vw] w-[60vw] bg-slate-50 md:hidden" />

            {/* Weekend Section */}
            <div className="flex w-full flex-col items-start justify-center">
              <div className="flex w-full flex-row justify-between">
                <span className="font-semibold">Weekend Meetings:</span>
                <span>{data.weekend.count}</span>
              </div>
              <div className="flex w-full flex-row justify-between">
                <span className="font-semibold">Overall:</span>
                <span>{data.weekend.total}</span>
              </div>
              <div className="flex w-full flex-row justify-between">
                <span className="font-semibold">Average:</span>
                <span>{data.weekend.average}</span>
              </div>
              <div className="flex w-full flex-row justify-between">
                <span className="font-semibold">Overall Deaf:</span>
                <span>{data.weekend.deafTotal}</span>
              </div>
              <div className="flex w-full flex-row justify-between">
                <span className="font-semibold">Deaf Average:</span>
                <span>{data.weekend.deafAverage}</span>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
