"use client";
import { useState, useEffect, useCallback, useMemo } from "react";
import {
  checkExistingAttendance,
  insertAttendance,
  subscribeToAttendanceChanges,
  updateAttendance,
} from "@/utils/supabase/database";
import LogDisplay from "./ui/LogDisplay";
import MeetingInfo from "./MeetingInfo";
import AttendanceInputGroup from "./AttendanceInputGroup";
import ControlButtons from "./ControlButtons";
import AttendanceInputGroupMobile from "./AttendanceInputGroupMobile";
import { AttendanceRecord } from "./types/attendanceTypes";

type MeetingType = "Midweek" | "Weekend";

export default function AttendanceForm() {
  // State management
  const [inputDate, setInputDate] = useState<string>("");
  const [dValue, setDValue] = useState<number | null>(null);
  const [hValue, setHValue] = useState<number | null>(null);
  const [originalDValue, setOriginalDValue] = useState<number | null>(0);
  const [originalHValue, setOriginalHValue] = useState<number | null>(0);
  const [remarks, setRemarks] = useState<string | null>();
  const [originalRemarks, setOriginalRemarks] = useState<string | null>();
  const [existingAttendance, setExistingAttendance] = useState<
    AttendanceRecord[] | null
  >(null);
  const [meetingInfo, setMeetingInfo] = useState<string>("");
  const [meetingInfoPL, setMeetingInfoPL] = useState<string>("");
  const [meetingType, setMeetingType] = useState<MeetingType>("Midweek");
  const [nextMeetingDate, setNextMeetingDate] = useState<string>("");
  const [isHovered, setIsHovered] = useState(false);
  const [isEditable, setIsEditable] = useState(false);
  const [logMessage, setLogMessage] = useState<string>("");
  const [isSaveClicked, setIsSaveClicked] = useState<boolean>(false);

  // Memoized values
  const today = useMemo<Date>(
    () => (inputDate ? new Date(`${inputDate} 23:15:30`) : new Date()),
    [inputDate],
  );

  const currentDay = useMemo<number>(() => today.getDay(), [today]);
  const totalValue = useMemo(
    () => (dValue || 0) + (hValue || 0),
    [dValue, hValue],
  );
  const hasChanges = useMemo(
    () =>
      hValue !== originalHValue ||
      dValue !== originalDValue ||
      remarks !== originalRemarks,
    [hValue, dValue, originalHValue, originalDValue, remarks, originalRemarks],
  );

  // Display meeting info with remarks override
  const displayMeetingInfo = useMemo(() => {
    if (remarks === "CO's visit") {
      return `CO's visit meeting – ${nextMeetingDate}`;
    } else if (remarks === "Memorial") {
      return `Memorial Meeting – ${nextMeetingDate}`;
    }
    return meetingInfo;
  }, [remarks, nextMeetingDate, meetingInfo]);

  // Calculate meeting information – now depends on remarks
  useEffect(() => {
    const formatDate = (date: Date) => {
      const month = date.toLocaleString("default", { month: "long" });
      const day = String(date.getDate()).padStart(2, "0");
      const year = date.getFullYear();
      return `${month} ${day}, ${year}`;
    };

    const getNextMeetingDate = (targetDay: number) => {
      const daysUntilTarget = (targetDay + 7 - currentDay) % 7 || 7;
      const nextMeetingDate = new Date(today);
      nextMeetingDate.setDate(today.getDate() + daysUntilTarget);
      return nextMeetingDate;
    };

    let meetingDateObj: Date;
    let type: MeetingType;

    // Special remarks override: use today's actual date
    if (remarks === "CO's visit" || remarks === "Memorial") {
      meetingDateObj = new Date(); // always current date
      const meetingDay = meetingDateObj.getDay();
      type = meetingDay === 0 || meetingDay === 6 ? "Weekend" : "Midweek";
    } else {
      // Normal schedule – determine the upcoming meeting date
      switch (currentDay) {
        case 0: // Sunday – meeting is today
          meetingDateObj = new Date(today);
          break;
        case 1: // Monday – next Wednesday
          meetingDateObj = getNextMeetingDate(3);
          break;
        case 2: // Tuesday – next Wednesday
          meetingDateObj = getNextMeetingDate(3);
          break;
        case 3: // Wednesday – meeting is today
          meetingDateObj = new Date(today);
          break;
        case 4: // Thursday – next Sunday
        case 5: // Friday – next Sunday
        case 6: // Saturday – next Sunday
          meetingDateObj = getNextMeetingDate(0);
          break;
        default:
          meetingDateObj = new Date(today);
      }

      const meetingDay = meetingDateObj.getDay();
      type = meetingDay === 0 || meetingDay === 6 ? "Weekend" : "Midweek";
    }

    const formattedDate = formatDate(meetingDateObj);
    setMeetingType(type);
    setMeetingInfo(`${type} Meeting – ${formattedDate}`);
    setMeetingInfoPL(formattedDate);
    setNextMeetingDate(formattedDate);
  }, [currentDay, today, remarks]);

  // Fetch and subscribe to attendance data
  useEffect(() => {
    const fetchAttendance = async () => {
      if (!nextMeetingDate) return;

      const attendance = await checkExistingAttendance(nextMeetingDate);
      if (attendance?.length) {
        const { hearing, deaf, remarks: existingRemarks } = attendance[0];
        setDValue(deaf);
        setHValue(hearing);
        setRemarks(existingRemarks || "");
        setOriginalDValue(deaf);
        setOriginalHValue(hearing);
        setOriginalRemarks(existingRemarks || "");
      } else if (remarks === "CO's visit" || remarks === "Memorial") {
        // Only reset attendance values, keep the remarks
        setDValue(null);
        setHValue(null);
        setOriginalDValue(null);
        setOriginalHValue(null);
        setExistingAttendance([]);
      } else {
        resetValues();
      }
      setExistingAttendance(attendance);
    };

    const unsubscribe = subscribeToAttendanceChanges((updatedData) => {
      const updatedRecord = updatedData.find(
        (record) => record.date_mm_dd_yyyy === nextMeetingDate,
      );

      if (updatedRecord) {
        const { hearing, deaf, remarks: updatedRemarks } = updatedRecord;
        setDValue(deaf);
        setHValue(hearing);
        setRemarks(updatedRemarks || "");
        setOriginalDValue(deaf);
        setOriginalHValue(hearing);
        setOriginalRemarks(updatedRemarks || "");
        setExistingAttendance([updatedRecord]);
      } else if (remarks === "CO's visit" || remarks === "Memorial") {
        // Only reset attendance values, keep the remarks
        setDValue(null);
        setHValue(null);
        setOriginalDValue(null);
        setOriginalHValue(null);
        setExistingAttendance([]);
      } else {
        resetValues();
      }
      showLogMessage("Received updated attendance count");
    });

    fetchAttendance();
    return () => unsubscribe();
  }, [nextMeetingDate, remarks]);

  // Helper functions
  const resetValues = () => {
    setDValue(null);
    setHValue(null);
    setRemarks("");
    setOriginalDValue(null);
    setOriginalHValue(null);
    setOriginalRemarks("");
    setExistingAttendance([]);
  };

  const showLogMessage = (message: string) => {
    setLogMessage(message);
    setIsSaveClicked(true);
    setTimeout(() => setIsSaveClicked(false), 1000);
  };

  const handleInputChange = useCallback(
    (setValue: (value: number | null) => void) =>
      (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        if (value === "") {
          setValue(null);
        } else {
          const sanitizedValue = value.replace(/^0+/, "") || "0";
          const numberValue = Math.max(0, Number(sanitizedValue));
          setValue(numberValue);
        }
      },
    [],
  );

  // Action handlers
  const handleCancel = useCallback(() => {
    setIsHovered(true);
    setDValue(originalDValue);
    setHValue(originalHValue);
    setRemarks(originalRemarks);
    setInputDate("");
    setIsEditable(false);
  }, [originalDValue, originalHValue, originalRemarks]);

  const handleValueChange = useCallback(
    (
      setter: React.Dispatch<React.SetStateAction<number | null>>,
      delta: number,
    ) => {
      setter((prev) => Math.max(0, (prev || 0) + delta));
    },
    [],
  );

  const handleSubmit = useCallback(async () => {
    if (!nextMeetingDate) return;

    const dateRegex = /^[A-Za-z]+\s\d{1,2},\s\d{4}$/;
    if (!dateRegex.test(nextMeetingDate)) {
      showLogMessage("Submission aborted. Invalid date.");
      return;
    }

    if (!hasChanges) {
      showLogMessage("No changes detected. Submission aborted.");
      return;
    }

    const hearing = hValue || 0;
    const deaf = dValue || 0;
    const total = totalValue;

    try {
      const existingRecord = existingAttendance?.find(
        (record) => record.date_mm_dd_yyyy === nextMeetingDate,
      );

      if (existingRecord) {
        await updateAttendance(
          nextMeetingDate,
          hearing,
          deaf,
          total,
          meetingType,
          remarks,
        );
        showLogMessage("Attendance updated successfully.");
      } else {
        await insertAttendance(
          nextMeetingDate,
          hearing,
          deaf,
          total,
          meetingType,
          remarks,
        );
        showLogMessage("New attendance record inserted successfully.");
      }

      setOriginalDValue(deaf);
      setOriginalHValue(hearing);
      setOriginalRemarks(remarks);
      setIsEditable(false);
    } catch (error) {
      showLogMessage(
        `Error during submission: ${error instanceof Error ? error.message : error}`,
      );
    }
  }, [
    nextMeetingDate,
    hValue,
    dValue,
    totalValue,
    existingAttendance,
    meetingType,
    remarks,
    hasChanges,
  ]);

  // Event handlers for value adjustments
  const handleAddHearing = useCallback(
    () => handleValueChange(setHValue, 1),
    [handleValueChange],
  );

  const handleMinusHearing = useCallback(
    () => handleValueChange(setHValue, -1),
    [handleValueChange],
  );

  const handleAddDeaf = useCallback(
    () => handleValueChange(setDValue, 1),
    [handleValueChange],
  );

  const handleMinusDeaf = useCallback(
    () => handleValueChange(setDValue, -1),
    [handleValueChange],
  );

  return (
    <div className="flex flex-col items-center justify-center">
      <section
        className="flex justify-center text-center"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        aria-label="Attendance form"
      >
        <div
          id="AttendanceForm"
          className="flex aspect-[16/9] max-h-[90vw] w-screen max-w-[100vw] flex-col items-center justify-center border border-foreground bg-card p-6 text-foreground"
        >
          <MeetingInfo
            isEditable={isEditable}
            meetingInfo={displayMeetingInfo}
            meetingInfoPL={meetingInfoPL}
            inputDate={inputDate}
            setInputDate={setInputDate}
          />

          {/* Deaf row – hidden on mobile, shown on sm+ */}
          <div className="w-full flex-col items-center justify-center py-3 sm:flex">
            <div className="flex w-full items-center justify-center">
              <div className="flex-1 text-right text-[6vw]">Deaf</div>
              <div className="flex w-10 items-center justify-center text-[6vw] md:w-16 lg:w-24">
                =
              </div>
              <div className="-ml-5 flex flex-1 justify-start">
                <AttendanceInputGroup
                  value={dValue}
                  onChange={handleInputChange(setDValue)}
                  isEditable={isEditable}
                  onIncrement={handleAddDeaf}
                  onDecrement={handleMinusDeaf}
                  size="sm"
                />
              </div>
            </div>

            {/* Hearing row – hidden on mobile, shown on sm+ */}
            <div className="flex w-full items-center justify-center">
              <div className="flex-1 text-right text-[6vw]">Hearing</div>
              <div className="flex w-10 items-center justify-center text-[6vw] md:w-16 lg:w-24">
                =
              </div>
              <div className="-ml-5 flex flex-1 justify-start">
                <AttendanceInputGroup
                  value={hValue}
                  onChange={handleInputChange(setHValue)}
                  isEditable={isEditable}
                  onIncrement={handleAddHearing}
                  onDecrement={handleMinusHearing}
                  size="sm"
                />
              </div>
            </div>
          </div>

          {/* Separator line */}
          <div className="my-2 h-1 w-[60vw] bg-foreground"></div>

          {/* Total row – visible on all screens */}
          <div className="ml-4 flex w-full items-center justify-center">
            <div className="flex-1 text-right text-[6vw]">Total</div>
            <div className="flex w-10 items-center justify-center text-[6vw] md:w-16 lg:w-24">
              =
            </div>
            <div className="flex flex-1 items-center justify-start text-[6vw]">
              <div>{totalValue}</div>
            </div>
          </div>

          <ControlButtons
            isHovered={isHovered}
            isEditable={isEditable}
            onEdit={() => setIsEditable(true)}
            onCancel={handleCancel}
            onSubmit={handleSubmit}
          />
        </div>

        <LogDisplay message={logMessage} isButtonClicked={isSaveClicked} />
      </section>

      {/* Remarks selector – Tailwind chips with toggle */}
      {isEditable && (
        <div className="m-4 flex w-full flex-wrap items-center justify-center gap-2">
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() =>
                setRemarks((prev) =>
                  prev === "CO's visit" ? null : "CO's visit",
                )
              }
              className={`rounded-full px-[4vw] py-[1vw] transition-colors sm:text-[1rem] lg:text-[2rem] ${
                remarks === "CO's visit"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-800 hover:bg-gray-300"
              }`}
              aria-pressed={remarks === "CO's visit"}
            >
              CO's visit
            </button>
            <button
              type="button"
              onClick={() =>
                setRemarks((prev) => (prev === "Memorial" ? null : "Memorial"))
              }
              className={`rounded-full px-[4vw] py-[1vw] transition-colors sm:text-[1rem] lg:text-[2rem] ${
                remarks === "Memorial"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-800 hover:bg-gray-300"
              }`}
              aria-pressed={remarks === "Memorial"}
            >
              Memorial
            </button>
          </div>
        </div>
      )}

      {/* Mobile‑only large counters – appear below the main form */}
      {isEditable && (
        <div className="mt-4 block w-full sm:hidden">
          <div className="flex flex-col items-center gap-6">
            {/* Deaf counter */}
            <div className="flex w-full items-center justify-center gap-4">
              {isEditable && <span className="text-5xl font-bold">D</span>}
              <AttendanceInputGroupMobile
                value={dValue}
                onChange={handleInputChange(setDValue)}
                isEditable={isEditable}
                onIncrement={handleAddDeaf}
                onDecrement={handleMinusDeaf}
                size="lg"
              />
            </div>
            {/* Hearing counter */}
            <div className="flex w-full items-center justify-center gap-4">
              {isEditable && <span className="text-5xl font-bold">H</span>}
              <AttendanceInputGroupMobile
                value={hValue}
                onChange={handleInputChange(setHValue)}
                isEditable={isEditable}
                onIncrement={handleAddHearing}
                onDecrement={handleMinusHearing}
                size="lg"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
