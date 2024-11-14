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
  countTotalMeetings,
  handleAttendanceUpdate,
  handleAttendanceDelete,
  loadLatestAttendanceData,
  subscribeToAttendance,
  calculateOverallTotals,
  calculateDeafTotals,
} from "./functions/attendanceUtils";
import { AttendanceRecord } from "./types/attendanceTypes";

const AttendanceTable = () => {
  const [attendanceData, setAttendanceData] = useState<AttendanceRecord[]>([]);
  const [editingRow, setEditingRow] = useState<string | null>(null);
  const [localEditedData, setLocalEditedData] =
    useState<AttendanceRecord | null>(null);
  const [logMessage, setLogMessage] = useState<string>("");
  const [isSaveButtonClicked, setIsSaveButtonClicked] = useState(false);
  const monthlyTotals = calculateOverallTotals(attendanceData);
  const monthlyDeafTotals = calculateDeafTotals(attendanceData);

  useEffect(() => {
    loadLatestAttendanceData(setAttendanceData);

    const unsubscribe = subscribeToAttendance(setAttendanceData);

    return () => unsubscribe();
  }, []);

  const monthlyAttendance = groupAttendanceByMonth(attendanceData);

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
    handleAttendanceUpdate(
      localEditedData,
      attendanceData,
      setAttendanceData,
      setLogMessage,
      setEditingRow,
      setLocalEditedData,
    );
    setIsSaveButtonClicked(true);
    setTimeout(() => setIsSaveButtonClicked(false), 1000); // Trigger the LogDisplay
  };

  const handleCancelEdit = () => {
    setEditingRow(null);
    setLocalEditedData(null); // Reset local edit data
  };

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
    setIsSaveButtonClicked(true);
    setTimeout(() => setIsSaveButtonClicked(false), 1000); // Trigger the LogDisplay
  };

  return (
    <div className="flex flex-col items-center justify-center py-[14vw]">
      <h1 className="mb-2 text-[5vw] font-bold max-sm:text-[7vw]">
        Attendance Updates
      </h1>
      {Object.entries(monthlyAttendance).map(([month, monthData]) => {
        const { midWeekCount, weekendCount } = countTotalMeetings(monthData);
        const { midWeekTotal, weekendTotal } = monthlyTotals[month];
        const { midWeekDeafTotal, weekendDeafTotal } = monthlyDeafTotals[month];

        return (
          <div
            key={month}
            className="m-[3vw] flex scale-95 flex-col items-center justify-center rounded-3xl bg-accent py-[3vw]"
          >
            <h2 className="mb-0.5 text-[3vw] font-bold max-sm:text-[5vw]">{`${month}`}</h2>
            <div className="mb-3 text-[2vw] font-normal max-sm:text-[4vw]">
              <h3 className="mb-3 flex items-center justify-center text-[2.5vw] font-normal max-sm:text-[4.5vw]">
                Reports:
              </h3>
              <div className="flex flex-row items-center justify-center gap-4">
                {/* added gap to space items */}
                <div className="flex flex-col items-center justify-center gap-4">
                  <div>{`Midweek Meetings: ${midWeekCount}`}</div>
                  <div>{`Overall Midweek Total: ${midWeekTotal}`}</div>
                  <div>{`Overall Deaf Total: ${midWeekDeafTotal}`}</div>
                </div>
                <div className="h-[14vw] w-[0.1vw] bg-slate-50" />
                {/* Horizontal line */}
                <div className="flex flex-col items-center justify-center gap-4">
                  <div className="flex flex-col items-center justify-center gap-4">
                    {`Weekend Meetings: ${weekendCount}`}
                  </div>
                  <div>{`Overall Weekend Total: ${weekendTotal}`}</div>
                  <div>{`Overall Deaf Total: ${weekendDeafTotal}`}</div>
                </div>
              </div>
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
