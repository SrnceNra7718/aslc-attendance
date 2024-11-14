// AttendanceTable.tsx
"use client"; // Indicates that this component is a client component
import { useEffect, useState } from "react";
import {
  deleteAttendance,
  fetchLatestAttendance,
  subscribeToAttendanceChanges,
  updateAttendance,
} from "@/utils/supabase/database"; // Function to update attendance

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
import { getMonthAndYearFromDate } from "./functions/attendanceUtils";

// Define the interface for each attendance record
interface AttendanceRecord {
  date_mm_dd_yyyy: string;
  meeting_type: string;
  deaf: number;
  hearing: number;
  total: number;
}

const AttendanceTable = () => {
  const [attendanceData, setAttendanceData] = useState<AttendanceRecord[]>([]);
  const [editingRow, setEditingRow] = useState<string | null>(null); // State for the row being edited
  const [localEditedData, setLocalEditedData] =
    useState<AttendanceRecord | null>(null); // State for input fields
  const [logMessage, setLogMessage] = useState<string>(""); // State for the log message
  const [isSaveButtonClicked, setIsSaveButtonClicked] = useState(false);

  useEffect(() => {
    const loadLatestData = async () => {
      const latestData = await fetchLatestAttendance();
      setAttendanceData(latestData || []); // Ensure default empty array if undefined
    };

    loadLatestData();

    // Subscribe to real-time changes in attendance

    const unsubscribe = subscribeToAttendanceChanges(
      (updatedData: AttendanceRecord[]) => {
        // Accept an array of AttendanceRecords
        setAttendanceData((prevData) => {
          const updatedAttendance = [...prevData];

          updatedData.forEach((record) => {
            const existingRecordIndex = updatedAttendance.findIndex(
              (item) => item.date_mm_dd_yyyy === record.date_mm_dd_yyyy,
            );

            if (existingRecordIndex !== -1) {
              // Update the existing record
              updatedAttendance[existingRecordIndex] = record;
            } else {
              // Add the new record if it doesn't exist
              updatedAttendance.push(record);
            }
          });

          return updatedAttendance;
        });
      },
    );

    return () => unsubscribe();
  }, []);

  // Group records by both month and meeting type (mid-week and weekend)
  const monthlyAttendance = attendanceData.reduce(
    (acc, item) => {
      const month = getMonthAndYearFromDate(
        item.date_mm_dd_yyyy || "Invalid Date",
      );

      const isWeekend =
        item.meeting_type?.toLowerCase().includes("weekend") || false;
      if (!acc[month]) {
        acc[month] = { midWeek: [], weekend: [] };
      }

      if (isWeekend) {
        acc[month].weekend.push(item);
      } else {
        acc[month].midWeek.push(item);
      }

      return acc;
    },
    {} as Record<
      string,
      { midWeek: AttendanceRecord[]; weekend: AttendanceRecord[] }
    >,
  );

  // Function to count meetings per meeting type for each month
  const countTotalMeetings = (monthData: {
    midWeek: AttendanceRecord[];
    weekend: AttendanceRecord[];
  }) => {
    const midWeekCount = monthData.midWeek.length;
    const weekendCount = monthData.weekend.length;

    return { midWeekCount, weekendCount };
  };

  // Columns definition for NextUI Table
  const columns = [
    { key: "date_mm_dd_yyyy", label: "Date" },
    { key: "meeting_type", label: "Meeting Type" },
    { key: "deaf", label: "Deaf" },
    { key: "hearing", label: "Hearing" },
    { key: "total", label: "Total" },
    { key: "edit", label: "Edit" },
  ];

  const handleEditClick = (rowKey: string, rowData: AttendanceRecord) => {
    setEditingRow(rowKey); // Set the current row as editable
    setLocalEditedData({ ...rowData }); // Copy row data to localEditedData for editing
  };

  const handleInputChange = (key: keyof AttendanceRecord, value: string) => {
    // Ensure the value is not negative and default to 0 if empty or invalid
    const numberValue = Math.max(0, Number(value) || 0);
    setLocalEditedData((prevData) => {
      if (prevData) {
        const updatedData = { ...prevData, [key]: numberValue };
        updatedData.total = updatedData.hearing + updatedData.deaf;
        return updatedData;
      }
      return null;
    });
  };

  const handleSave = async () => {
    if (localEditedData) {
      const { date_mm_dd_yyyy, hearing, deaf, total, meeting_type } =
        localEditedData;

      const originalData = attendanceData.find(
        (record) => record.date_mm_dd_yyyy === date_mm_dd_yyyy,
      );

      if (!originalData) {
        setLogMessage("Original record not found. Submission aborted.");
        return;
      }

      const hasChanges =
        hearing !== originalData.hearing || deaf !== originalData.deaf;
      if (!hasChanges) {
        setLogMessage("No changes detected. Submission aborted.");
        return;
      }

      try {
        await updateAttendance(
          date_mm_dd_yyyy,
          hearing,
          deaf,
          total,
          meeting_type,
        );

        setAttendanceData((prevData) =>
          prevData.map((item) =>
            item.date_mm_dd_yyyy === date_mm_dd_yyyy
              ? { ...item, hearing, deaf, total }
              : item,
          ),
        );

        setLogMessage("Attendance updated successfully.");
        setEditingRow(null);
        setLocalEditedData(null);
      } catch (error) {
        setLogMessage(`Error during attendance submission: ${error}`);
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
    <div className="flex flex-col items-center justify-center py-[14vw]">
      <h1 className="mb-2 text-[5vw] font-bold max-sm:text-[7vw]">
        Attendance Updates
      </h1>
      {Object.entries(monthlyAttendance).map(([month, monthData]) => {
        const { midWeekCount, weekendCount } = countTotalMeetings(monthData);
        return (
          <div
            key={month}
            className="m-[3vw] flex scale-95 flex-col items-center justify-center rounded-3xl bg-accent py-[3vw]"
          >
            <h2 className="mb-0.5 text-[3vw] font-bold max-sm:text-[5vw]">{`${month}`}</h2>
            <div className="mb-3 text-[2vw] font-normal max-sm:text-[4vw]">
              Number of Midweek Meetings: {midWeekCount}
              <br />
              Number of Weekend Meetings: {weekendCount}
            </div>
            {/* Display Mid-week Meetings */}
            <h2 className="mt-1 text-[2vw] font-bold max-sm:text-[4vw]">{`Mid-week Meetings`}</h2>
            <Table
              aria-label="Mid-week Attendance"
              className="w-screen px-[6vw]"
            >
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
                {monthData.midWeek.map((item) => (
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
                              : (localEditedData?.deaf ?? item.deaf).toString()
                          } // Show 0 explicitly if the value is 0
                          onChange={(e) =>
                            handleInputChange("deaf", e.target.value)
                          }
                          className="-m-3 w-16 max-md:w-[10vw]"
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
                              : (
                                  localEditedData?.hearing ?? item.hearing
                                ).toString()
                          }
                          onChange={(e) =>
                            handleInputChange("hearing", e.target.value)
                          }
                          className="-m-3 w-16 max-md:w-[10vw]"
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
            {/* Display Weekend Meetings */}
            <h2 className="mt-3 text-[2vw] font-bold max-sm:text-[4vw]">{`Weekend Meetings`}</h2>
            <Table
              aria-label="Weekend Attendance"
              className="w-screen px-[6vw]"
            >
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
                {monthData.weekend.map((item) => (
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
                              : (localEditedData?.deaf ?? item.deaf).toString()
                          }
                          onChange={(e) =>
                            handleInputChange("deaf", e.target.value)
                          }
                          className="-m-3 w-16 max-md:w-[10vw]"
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
                              : (
                                  localEditedData?.hearing ?? item.hearing
                                ).toString()
                          }
                          onChange={(e) =>
                            handleInputChange("hearing", e.target.value)
                          }
                          className="-m-3 w-16 max-md:w-[10vw]"
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
          </div>
        );
      })}

      {logMessage && (
        <LogDisplay
          message={logMessage}
          isButtonClicked={isSaveButtonClicked}
        />
      )}
      {/* Display LogDisplay with log message */}
    </div>
  );
};

export default AttendanceTable;
