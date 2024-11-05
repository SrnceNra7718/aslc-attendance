"use client"; // Indicates that this component is a client component
import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client"; // Supabase client
import { updateAttendance } from "@/utils/supabase/database"; // Function to update attendance

import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Tooltip,
  Input,
} from "@nextui-org/react"; // Ensure correct imports for NextUI
import { Pencil, Save } from "lucide-react"; // Import Pencil icon from lucide-react

const supabase = createClient(); // Create a Supabase client instance

// Function to fetch the latest attendance records
const fetchLatestAttendance = async () => {
  try {
    const { data: attendance, error } = await supabase
      .from("attendance")
      .select("date_mm_dd_yyyy, meeting_type, deaf, hearing, total")
      .order("date_mm_dd_yyyy", { ascending: false }) // Order by date descending
      .limit(10); // Limit to the latest 10 records

    if (error) {
      console.error("Error fetching latest attendance:", error);
      return [];
    }
    return attendance || []; // Return attendance data or an empty array
  } catch (err) {
    console.error("Unexpected error:", err);
    return []; // Return an empty array on error
  }
};

const AttendanceTable = () => {
  const [attendanceData, setAttendanceData] = useState<any[]>([]); // State for attendance data
  const [editingRow, setEditingRow] = useState<string | null>(null); // State for the row being edited
  const [localEditedData, setLocalEditedData] = useState<any>(null); // State for input fields

  useEffect(() => {
    const loadLatestData = async () => {
      const latestData = await fetchLatestAttendance(); // Fetch latest data
      setAttendanceData(latestData); // Update attendance data state
    };
    loadLatestData();

    const intervalId = setInterval(loadLatestData, 10000); // Refresh every 10 seconds
    return () => clearInterval(intervalId); // Clear interval on component unmount
  }, []);

  // Columns definition for NextUI Table
  const columns = [
    { key: "edit", label: "Edit" },
    { key: "date_mm_dd_yyyy", label: "Date" },
    { key: "meeting_type", label: "Meeting Type" },
    { key: "deaf", label: "Deaf" },
    { key: "hearing", label: "Hearing" },
    { key: "total", label: "Total" },
  ];

  const handleEditClick = (rowKey: string, rowData: any) => {
    setEditingRow(rowKey); // Set the current row as editable
    setLocalEditedData({ ...rowData }); // Copy row data to localEditedData for editing
  };

  const handleInputChange = (key: string, value: string) => {
    const numberValue = Number(value) || 0; // Convert to number or default to 0
    setLocalEditedData((prevData: any) => {
      const updatedData = { ...prevData, [key]: numberValue };
      updatedData.total = updatedData.hearing + updatedData.deaf; // Update total in real-time
      return updatedData; // Return updated data
    });
  };

  const handleSave = async () => {
    if (localEditedData) {
      const { date_mm_dd_yyyy, hearing, deaf, meeting_type, total } =
        localEditedData; // Destructure edited data

      await updateAttendance(
        date_mm_dd_yyyy,
        Number(hearing),
        Number(deaf),
        total,
        meeting_type,
      ); // Update attendance in the database

      setAttendanceData((prevData) =>
        prevData.map((item) =>
          item.date_mm_dd_yyyy === date_mm_dd_yyyy
            ? { ...item, hearing, deaf, total } // Update item in attendance data
            : item,
        ),
      );

      setEditingRow(null); // Exit edit mode
      setLocalEditedData(null); // Reset local edited data
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-[14vw]">
      <h1 className="mb-4 text-[5vw] font-bold">Attendance Updates</h1>
      <Table className="w-screen px-[6vw] text-[1vw] max-md:text-[20vw]">
        <TableHeader columns={columns}>
          {(column) => (
            <TableColumn
              className="text-[2vw] max-sm:text-[4vw]"
              key={column.key}
            >
              {column.label}
            </TableColumn>
          )}
        </TableHeader>
        <TableBody>
          {attendanceData.map((item) => (
            <TableRow
              key={item.date_mm_dd_yyyy}
              className="text-[1.5vw] max-sm:text-[3vw]"
            >
              <TableCell>
                {editingRow === item.date_mm_dd_yyyy ? (
                  <button
                    onClick={handleSave}
                    className="rounded bg-green-500 px-2 py-1 text-white"
                  >
                    <Save size={18} />
                  </button>
                ) : (
                  <button
                    onClick={() => handleEditClick(item.date_mm_dd_yyyy, item)}
                    className="px-2 py-1 text-blue-500 underline"
                  >
                    <Pencil size={18} />
                  </button>
                )}
              </TableCell>
              <TableCell>{item.date_mm_dd_yyyy ?? "N/A"}</TableCell>
              <TableCell>{item.meeting_type ?? "N/A"}</TableCell>
              <TableCell>
                {editingRow === item.date_mm_dd_yyyy ? (
                  <Input
                    type="number"
                    variant="bordered"
                    value={localEditedData?.deaf || item.deaf} // Use local state for editable input
                    onChange={(e) => handleInputChange("deaf", e.target.value)}
                    className="-m-3 w-16 max-md:w-[15vw]"
                  />
                ) : (
                  (item.deaf ?? "N/A")
                )}
              </TableCell>
              <TableCell>
                {editingRow === item.date_mm_dd_yyyy ? (
                  <Input
                    variant="bordered"
                    type="number"
                    value={localEditedData?.hearing || item.hearing} // Use local state for editable input
                    onChange={(e) =>
                      handleInputChange("hearing", e.target.value)
                    }
                    className="-m-3 w-16 max-md:w-[15vw]"
                  />
                ) : (
                  (item.hearing ?? "N/A")
                )}
              </TableCell>
              <TableCell>
                {editingRow === item.date_mm_dd_yyyy
                  ? localEditedData?.total // Show the calculated total
                  : (item.total ?? "N/A")}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default AttendanceTable;
