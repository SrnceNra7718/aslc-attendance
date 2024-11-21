"use client";

import { useEffect, useState } from "react";
import { Pencil, Save, Trash2, XCircle } from "lucide-react";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Input,
} from "@nextui-org/react";
import LogDisplay from "./ui/LogDisplay";
import {
  groupAttendanceByMonth,
  handleAttendanceUpdate,
  handleAttendanceDelete,
  loadLatestAttendanceData,
  subscribeToAttendance,
  calculateOverallTotals,
  calculateDeafTotals,
} from "./functions/attendanceUtils";
import { AttendanceRecord } from "./types/attendanceTypes";
import { Reports } from "./Reports";

interface AttendanceTableProps {
  selectedMonth: string | null; // Selected month for filtering (e.g., "01" for January)
  selectedYear: string | null; // Selected year for filtering (e.g., "2024")
}

const AttendanceTable: React.FC<AttendanceTableProps> = ({
  selectedMonth,
  selectedYear,
}) => {
  const [attendanceData, setAttendanceData] = useState<AttendanceRecord[]>([]); // Holds all attendance records
  const [editingRow, setEditingRow] = useState<string | null>(null); // Tracks the currently edited row
  const [localEditedData, setLocalEditedData] =
    useState<AttendanceRecord | null>(null); // Temporary data for inline editing
  const [logMessage, setLogMessage] = useState<string>(""); // Message to display in LogDisplay
  const [isSaveButtonClicked, setIsSaveButtonClicked] = useState(false); // Controls LogDisplay animation

  // Load attendance data and set up real-time updates
  useEffect(() => {
    loadLatestAttendanceData(setAttendanceData); // Fetch latest attendance data on mount

    const unsubscribe = subscribeToAttendance(setAttendanceData); // Subscribe to real-time updates

    return () => unsubscribe(); // Cleanup subscription on unmount
  }, []);

  // Filter attendance records based on the selected month and year
  const filteredAttendance = attendanceData.filter((record) => {
    const [month, , year] = record.date_mm_dd_yyyy.split(/ |, /);

    console.log(selectedMonth);
    console.log(selectedYear);

    return (
      (!selectedMonth || selectedMonth === month) &&
      (!selectedYear || selectedYear === year)
    );
  });

  // Group filtered data by month for rendering and calculations
  const monthlyAttendance = groupAttendanceByMonth(filteredAttendance);

  // Calculate overall totals for the filtered data
  const monthlyTotals = calculateOverallTotals(filteredAttendance);

  // Calculate deaf totals for the filtered data
  const monthlyDeafTotals = calculateDeafTotals(filteredAttendance);

  // Define table columns
  const columns = [
    { key: "date_mm_dd_yyyy", label: "Date" },
    { key: "meeting_type", label: "Meeting Type" },
    { key: "deaf", label: "Deaf" },
    { key: "hearing", label: "Hearing" },
    { key: "total", label: "Total" },
    { key: "edit", label: "Edit" },
  ];

  // Handle starting inline editing for a specific row
  const handleEditClick = (rowKey: string, rowData: AttendanceRecord) => {
    setEditingRow(rowKey); // Set the current row as editable
    setLocalEditedData({ ...rowData }); // Copy row data to local state for editing
  };

  // Handle input changes for inline editing, ensuring non-negative values
  const handleInputChange = (key: keyof AttendanceRecord, value: string) => {
    const numberValue = Math.max(0, Number(value) || 0); // Ensure non-negative values
    setLocalEditedData((prevData) => {
      if (prevData) {
        const updatedData = { ...prevData, [key]: numberValue };
        updatedData.total = updatedData.hearing + updatedData.deaf; // Update total
        return updatedData;
      }
      return null;
    });
  };

  // Save the edited data to the database and update state
  const handleSave = async () => {
    handleAttendanceUpdate(
      localEditedData,
      attendanceData,
      setAttendanceData,
      setLogMessage,
      setEditingRow,
      setLocalEditedData,
    );
    setIsSaveButtonClicked(true); // Trigger LogDisplay animation
    setTimeout(() => setIsSaveButtonClicked(false), 1000); // Reset animation state
  };

  // Cancel inline editing and reset local state
  const handleCancelEdit = () => {
    setEditingRow(null); // Clear the editing row
    setLocalEditedData(null); // Reset local edited data
  };

  // Delete a record and update the state
  const handleDelete = async (date_mm_dd_yyyy: string) => {
    handleAttendanceDelete(
      date_mm_dd_yyyy,
      attendanceData,
      setAttendanceData,
      setLogMessage,
      setEditingRow,
      setLocalEditedData,
      setIsSaveButtonClicked,
    );
    setIsSaveButtonClicked(true); // Trigger LogDisplay animation
    setTimeout(() => setIsSaveButtonClicked(false), 1000); // Reset animation state
  };

  return (
    <div className="flex flex-col items-center justify-center">
      {/* Render grouped attendance data */}
      {Object.entries(monthlyAttendance).map(([month, monthData]) => {
        const { midWeekTotal, weekendTotal } = monthlyTotals[month];
        const { midWeekDeafTotal, weekendDeafTotal } = monthlyDeafTotals[month];

        return (
          <div
            key={month}
            className="flex flex-col items-center justify-center rounded-3xl bg-accent"
          >
            {/* Reports Component */}
            <Reports
              monthlyAttendance={{ [month]: monthData }}
              monthlyTotals={{ [month]: { midWeekTotal, weekendTotal } }}
              monthlyDeafTotals={{
                [month]: { midWeekDeafTotal, weekendDeafTotal },
              }}
            />

            {/* Render Midweek Meetings */}
            <h2 className="mt-1 text-[2vw] font-bold max-sm:text-[4vw]">
              Midweek Meetings
            </h2>
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
                  <TableRow key={item.date_mm_dd_yyyy}>
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

            {/* Render Weekend Meetings */}
            <h2 className="mt-3 text-[2vw] font-bold max-sm:text-[4vw]">
              Weekend Meetings
            </h2>
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
                  <TableRow key={item.date_mm_dd_yyyy}>
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

      {/* LogDisplay Component */}
      {logMessage && (
        <LogDisplay
          message={logMessage}
          isButtonClicked={isSaveButtonClicked}
        />
      )}
    </div>
  );
};

export default AttendanceTable;
