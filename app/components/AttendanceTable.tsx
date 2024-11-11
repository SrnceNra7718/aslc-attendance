// AttendanceTable.tsx
"use client"; // Indicates that this component is a client component
import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client"; // Supabase client
import { deleteAttendance, updateAttendance } from "@/utils/supabase/database"; // Function to update attendance

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
import { Pencil, Save, Trash2, XCircle } from "lucide-react"; // Import Pencil icon from lucide-react
import LogDisplay from "./ui/LogDisplay";

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
  const [logMessage, setLogMessage] = useState<string>(""); // State for the log message
  const [isSaveButtonClicked, setIsSaveButtonClicked] = useState(false); // State for save button click

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
    { key: "date_mm_dd_yyyy", label: "Date" },
    { key: "meeting_type", label: "Meeting Type" },
    { key: "deaf", label: "Deaf" },
    { key: "hearing", label: "Hearing" },
    { key: "total", label: "Total" },
    { key: "edit", label: "Edit" },
  ];

  const handleEditClick = (rowKey: string, rowData: any) => {
    setEditingRow(rowKey); // Set the current row as editable
    setLocalEditedData({ ...rowData }); // Copy row data to localEditedData for editing
  };

  const handleInputChange = (key: string, value: string) => {
    // Ensure the value is not negative and default to 0 if empty or invalid
    const numberValue = Math.max(0, Number(value) || 0);
    setLocalEditedData((prevData: any) => {
      const updatedData = { ...prevData, [key]: numberValue };
      updatedData.total = updatedData.hearing + updatedData.deaf; // Update total in real-time
      return updatedData; // Return updated data
    });
  };

  const handleSave = async () => {
    if (localEditedData) {
      const formattedDate = localEditedData.date_mm_dd_yyyy;
      const hearing = Number(localEditedData.hearing) || 0;
      const deaf = Number(localEditedData.deaf) || 0;
      const total = localEditedData.total;
      const meetingType = localEditedData.meeting_type;

      // Retrieve the original values from attendanceData
      const originalData = attendanceData.find(
        (record) => record.date_mm_dd_yyyy === formattedDate,
      );

      if (!originalData) {
        console.error("Original record not found. Submission aborted.");
        setLogMessage("Original record not found. Submission aborted.");
        setIsSaveButtonClicked(true);
        setTimeout(() => setIsSaveButtonClicked(false), 1000);
        return;
      }

      // Validate that the values have changed compared to the original values
      const hasChanges =
        hearing !== originalData.hearing || deaf !== originalData.deaf;

      if (!hasChanges) {
        console.log("No changes detected. Submission aborted.");
        setLogMessage("No changes detected. Submission aborted.");
        setIsSaveButtonClicked(true);
        setTimeout(() => setIsSaveButtonClicked(false), 1000);
        return;
      }

      try {
        // Update existing record in the database
        await updateAttendance(
          formattedDate,
          hearing,
          deaf,
          total,
          meetingType,
        );
        setLogMessage("Attendance updated successfully.");
        setIsSaveButtonClicked(true);
        setTimeout(() => setIsSaveButtonClicked(false), 1000);

        // Update the attendanceData state with the modified values
        setAttendanceData((prevData) =>
          prevData.map((item) =>
            item.date_mm_dd_yyyy === formattedDate
              ? { ...item, hearing, deaf, total }
              : item,
          ),
        );

        setEditingRow(null);
        setLocalEditedData(null);
      } catch (error) {
        setLogMessage(`Error during attendance submission: ${error}`);
        console.error("Error during attendance submission:", error);
      }
    }
  };

  const handleCancelEdit = () => {
    setEditingRow(null);
    setLocalEditedData(null); // Reset local edit data
  };

  const handleDelete = async (date_mm_dd_yyyy: string) => {
    try {
      // Find the record to be deleted based on the date_mm_dd_yyyy
      const recordToDelete = attendanceData.find(
        (record) => record.date_mm_dd_yyyy === date_mm_dd_yyyy,
      );

      if (!recordToDelete) {
        console.error("Record not found for deletion.");
        setLogMessage("Record not found for deletion.");
        setIsSaveButtonClicked(true);
        setTimeout(() => setIsSaveButtonClicked(false), 1000);
        return;
      }

      // Perform the deletion
      const isDeleted = await deleteAttendance(date_mm_dd_yyyy);

      if (isDeleted) {
        // Update state to remove deleted record from the table
        setAttendanceData((prevData) =>
          prevData.filter((item) => item.date_mm_dd_yyyy !== date_mm_dd_yyyy),
        );
        setLogMessage("Attendance record deleted successfully.");
      } else {
        console.error("Failed to delete attendance record.");
        setLogMessage("Failed to delete attendance record.");
      }
      setIsSaveButtonClicked(true);
      setTimeout(() => setIsSaveButtonClicked(false), 1000);

      // Clear any editing state after delete
      setEditingRow(null);
      setLocalEditedData(null);
    } catch (error) {
      setLogMessage(`Error during deletion: ${error}`);
      console.error("Error during deletion:", error);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-[14vw]">
      <h1 className="mb-4 text-[5vw] font-bold max-sm:text-[7vw]">
        Attendance Updates
      </h1>
      <Table aria-label="AttendanceTable" className="w-screen px-[6vw]">
        <TableHeader columns={columns}>
          {(column) => (
            <TableColumn
              className="text-[1.5vw] max-sm:text-[3vw]"
              key={column.key}
            >
              {column.label}
            </TableColumn>
          )}
        </TableHeader>
        <TableBody>
          {attendanceData.map((item) => (
            <TableRow key={item.date_mm_dd_yyyy} className="text-[1vw]">
              <TableCell>{item.date_mm_dd_yyyy ?? "N/A"}</TableCell>
              <TableCell>{item.meeting_type ?? "N/A"}</TableCell>
              <TableCell>
                {editingRow === item.date_mm_dd_yyyy ? (
                  <Input
                    aria-label="deaf"
                    type="number"
                    variant="bordered"
                    value={
                      localEditedData?.deaf === 0
                        ? "0"
                        : localEditedData?.deaf || item.deaf
                    } // Show 0 explicitly if the value is 0
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
                    aria-label="hearing"
                    variant="bordered"
                    type="number"
                    value={
                      localEditedData?.hearing === 0
                        ? "0"
                        : localEditedData?.hearing || item.hearing
                    } // Show 0 explicitly if the value is 0
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
              <TableCell>
                {editingRow === item.date_mm_dd_yyyy ? (
                  <div className="flex gap-1">
                    <button
                      onClick={handleSave}
                      className="rounded bg-green-500 px-1 py-0.5 text-white"
                    >
                      <Save size={18} />
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      className="rounded bg-gray-500 px-1 py-0.5 text-white"
                    >
                      <XCircle size={18} /> {/* Cancel button */}
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-1">
                    <button
                      onClick={() =>
                        handleEditClick(item.date_mm_dd_yyyy, item)
                      }
                      className="px-1 py-0.5 text-blue-500 underline"
                    >
                      <Pencil size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(item.date_mm_dd_yyyy)} // Pass date_mm_dd_yyyy to handleDelete
                      className="rounded px-1 py-0.5 text-red-500"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {logMessage && (
        <LogDisplay
          message={logMessage}
          isButtonClicked={isSaveButtonClicked}
        />
      )}{" "}
      {/* Display LogDisplay with log message */}
    </div>
  );
};

export default AttendanceTable;
