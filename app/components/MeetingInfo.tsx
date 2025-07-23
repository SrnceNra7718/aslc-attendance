import React from "react";

interface MeetingInfoProps {
  isEditable: boolean;
  meetingInfo: string;
  meetingInfoPL: string;
  inputDate: string;
  setInputDate: (value: string) => void;
}

const MeetingInfo: React.FC<MeetingInfoProps> = ({
  isEditable,
  meetingInfo,
  meetingInfoPL,
  inputDate,
  setInputDate,
}) => (
  <div>
    <h1 className="text-size flex items-center justify-center text-[6vw] font-extrabold">
      Attendance
    </h1>
    <h3 className="-mt-2 flex w-full items-center justify-center text-[4vw] font-medium">
      {isEditable ? (
        <input
          type="text"
          value={inputDate}
          onChange={(e) => setInputDate(e.target.value)}
          placeholder={meetingInfoPL}
          className="w-full bg-transparent text-center text-[4vw] outline-none focus:outline-none"
          aria-label="Edit meeting date"
        />
      ) : (
        <span className="text-[4vw]">{meetingInfo}</span>
      )}
    </h3>
  </div>
);

export default MeetingInfo;
