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

// Type definitions
type AttendanceRecord = {
  hearing: number | null;
  deaf: number | null;
  date_mm_dd_yyyy: string;
};

type MeetingType = "Midweek" | "Weekend";

export default function AttendanceForm() {
  // State management
  const [inputDate, setInputDate] = useState<string>("");
  const [dValue, setDValue] = useState<number | null>(null);
  const [hValue, setHValue] = useState<number | null>(null);
  const [originalDValue, setOriginalDValue] = useState<number | null>(0);
  const [originalHValue, setOriginalHValue] = useState<number | null>(0);
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
  const today = useMemo(
    () => (inputDate ? new Date(`${inputDate} 23:15:30`) : new Date()),
    [inputDate],
  );

  const currentDay = useMemo(() => today.getDay(), [today]);
  const totalValue = useMemo(
    () => (dValue || 0) + (hValue || 0),
    [dValue, hValue],
  );
  const hasChanges = useMemo(
    () => hValue !== originalHValue || dValue !== originalDValue,
    [hValue, dValue, originalHValue, originalDValue],
  );

  // Calculate meeting information
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

    const getMeetingInfo = () => {
      let nextMeetingDate: Date;
      let type: MeetingType = "Midweek";

      switch (currentDay) {
        case 0: // Sunday
          type = "Weekend";
          nextMeetingDate = today;
          break;
        case 1: // Monday
          nextMeetingDate = getNextMeetingDate(3); // Wednesday
          break;
        case 2: // Tuesday
          nextMeetingDate = today;
          break;
        case 3: // Wednesday
          nextMeetingDate = today;
          break;
        case 6: // Saturday
          type = "Weekend";
          nextMeetingDate = today;
          break;
        default: // Thursday, Friday
          type = "Weekend";
          nextMeetingDate = getNextMeetingDate(0); // Sunday
          break;
      }

      const formattedDate = formatDate(nextMeetingDate);
      setMeetingType(type);
      setMeetingInfo(`${type} Meeting – ${formattedDate}`);
      setMeetingInfoPL(formattedDate);
      setNextMeetingDate(formattedDate);
    };

    getMeetingInfo();
  }, [currentDay, today]);

  // Fetch and subscribe to attendance data
  useEffect(() => {
    const fetchAttendance = async () => {
      if (!nextMeetingDate) return;

      const attendance = await checkExistingAttendance(nextMeetingDate);
      if (attendance?.length) {
        const { hearing, deaf } = attendance[0];
        setDValue(deaf);
        setHValue(hearing);
        setOriginalDValue(deaf);
        setOriginalHValue(hearing);
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
        const { hearing, deaf } = updatedRecord;
        setDValue(deaf);
        setHValue(hearing);
        setOriginalDValue(deaf);
        setOriginalHValue(hearing);
        setExistingAttendance([updatedRecord]);
      } else {
        resetValues();
      }
      showLogMessage("Received updated attendance count");
    });

    fetchAttendance();
    return () => unsubscribe();
  }, [nextMeetingDate]);

  // Helper functions
  const resetValues = () => {
    setDValue(null);
    setHValue(null);
    setOriginalDValue(null);
    setOriginalHValue(null);
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
    setInputDate("");
    setIsEditable(false);
  }, [originalDValue, originalHValue]);

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
        );
        showLogMessage("Attendance updated successfully.");
      } else {
        await insertAttendance(
          nextMeetingDate,
          hearing,
          deaf,
          total,
          meetingType,
        );
        showLogMessage("New attendance record inserted successfully.");
      }

      setOriginalDValue(deaf);
      setOriginalHValue(hearing);
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
    <button
      type="button"
      className="flex justify-center text-center"
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => setIsHovered((prev) => !prev)}
    >
      <div
        id="AttendanceForm"
        className="flex aspect-[16/9] max-h-[90vw] w-screen max-w-[100vw] flex-col items-center justify-center border border-foreground bg-card p-6 text-foreground"
      >
        <MeetingInfo
          isEditable={isEditable}
          meetingInfo={meetingInfo}
          meetingInfoPL={meetingInfoPL}
          inputDate={inputDate}
          setInputDate={setInputDate}
        />

        <div className="-m-2 flex w-full flex-col items-center justify-center py-3">
          {/* Deaf row */}
          <div className="flex w-full items-center justify-center">
            <div className="flex-1 text-right text-[6vw]">Deaf</div>
            <div className="w-10 text-center text-[6vw] md:w-16 lg:w-24">=</div>
            <div className="-ml-5 flex flex-1 justify-start">
              <AttendanceInputGroup
                value={dValue}
                onChange={handleInputChange(setDValue)}
                isEditable={isEditable}
                onIncrement={handleAddDeaf}
                onDecrement={handleMinusDeaf}
                isHearing={false}
              />
            </div>
          </div>

          {/* Hearing row */}
          <div className="flex w-full items-center justify-center">
            <div className="flex-1 text-right text-[6vw]">Hearing</div>
            <div className="w-10 text-center text-[6vw] md:w-16 lg:w-24">=</div>
            <div className="-ml-5 flex flex-1 justify-start">
              <AttendanceInputGroup
                value={hValue}
                onChange={handleInputChange(setHValue)}
                isEditable={isEditable}
                onIncrement={handleAddHearing}
                onDecrement={handleMinusHearing}
                isHearing={true}
              />
            </div>
          </div>

          {/* Separator line */}
          <div className="my-2 h-1 w-[60vw] bg-foreground"></div>

          {/* Total row */}
          <div className="flex w-full items-center justify-center">
            <div className="flex-1 text-right text-[6vw]">Total</div>
            <div className="w-10 text-center text-[6vw] md:w-16 lg:w-24">=</div>
            <div className="-ml-5 flex flex-1 justify-start text-center text-[6vw]">
              <div className="w-[16.5vw] max-w-[130px]">{totalValue}</div>
            </div>
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
    </button>
  );
}
