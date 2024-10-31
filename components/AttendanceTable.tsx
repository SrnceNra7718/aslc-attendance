"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
} from "@nextui-org/react"; // Ensure correct imports for NextUI

const supabase = createClient();

// Define the data fetching function
const fetchLatestAttendance = async () => {
  try {
    let { data: attendance, error } = await supabase
      .from("attendance")
      .select("date_mm_dd_yyyy, meeting_type, deaf, hearing, total")
      .order("date_mm_dd_yyyy", { ascending: false })
      .limit(10);

    if (error) {
      console.error("Error fetching latest attendance:", error);
      return [];
    }
    return attendance || [];
  } catch (err) {
    console.error("Unexpected error:", err);
    return [];
  }
};

const AttendanceTable = () => {
  const [attendanceData, setAttendanceData] = useState<any[]>([]);

  useEffect(() => {
    const loadLatestData = async () => {
      const latestData = await fetchLatestAttendance();
      setAttendanceData(latestData);
    };
    loadLatestData();

    // Optional refresh every 10 seconds
    const intervalId = setInterval(loadLatestData, 10000);
    return () => clearInterval(intervalId); // Cleanup on unmount
  }, []);

  // Columns definition for NextUI Table
  const columns = [
    { key: "date_mm_dd_yyyy", label: "Date" },
    { key: "meeting_type", label: "Meeting Type" },
    { key: "deaf", label: "Deaf" },
    { key: "hearing", label: "Hearing" },
    { key: "total", label: "Total" },
  ];

  return (
    <div className="flex flex-col items-center justify-center p-[14vw]">
      <h1 className="mb-4 text-[5vw] font-bold">Attendance Updates</h1>
      <Table aria-label="Attendance Table" className="w-screen">
        <TableHeader columns={columns}>
          {(column) => (
            <TableColumn key={column.key}>{column.label}</TableColumn>
          )}
        </TableHeader>
        <TableBody items={attendanceData} className="text-[1vw]">
          {(item) => (
            <TableRow key={item.date_mm_dd_yyyy}>
              {(columnKey) => <TableCell>{item[columnKey] ?? "N/A"}</TableCell>}
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default AttendanceTable;
