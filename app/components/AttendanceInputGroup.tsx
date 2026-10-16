// AttendanceInputGroup.tsx
import React from "react";
import { Button } from "@heroui/react";
import { CircleMinus, CirclePlus } from "lucide-react";

interface AttendanceInputGroupProps {
  value: number | null;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isEditable: boolean;
  onIncrement: () => void;
  onDecrement: () => void;
  size?: "sm" | "lg"; // sm = inline, lg = mobile big counter
  isHearing?: boolean;
}

const AttendanceInputGroup: React.FC<AttendanceInputGroupProps> = ({
  value,
  onChange,
  isEditable,
  onIncrement,
  onDecrement,
  size = "sm",
  isHearing = false,
}) => {
  // Size classes
  const sizeClasses = {
    sm: {
      // Buttons scale with the same 6vw rhythm as the Total row.
      button:
        "hidden items-center sm:flex " +
        "p-3 sm:p-0 sm:h-[6vw] sm:w-[8vw] sm:min-h-[2.5rem] sm:min-w-[3.5rem]",
      // Input matches the Total number: text-[6vw], no caps.
      // Width in vw guarantees 2–3 digits always fit.
      input:
        "w-24 min-w-[5rem] text-3xl px-1 " +
        "sm:w-[18vw] sm:min-w-[6rem] sm:text-[6vw]",
    },
    lg: {
      button: "p-5 text-2xl w-20 h-20 sm:hidden",
      // Big mobile counter — room for 2–3 digits too.
      input: "w-28 min-w-[6rem] px-1 text-4xl",
    },
  };

  const current = sizeClasses[size];

  return (
    <div className="flex items-center justify-center gap-2 sm:gap-0">
      {isEditable && (
        <Button
          size="sm"
          color="danger"
          variant="solid"
          onPress={onDecrement}
          className={`rounded-l-full bg-red-600 text-slate-100 ${current.button}`}
          aria-label="Decrease count"
        >
          <CircleMinus size={size === "lg" ? 28 : 17} />
        </Button>
      )}

      <input
        type="number"
        inputMode="numeric"
        pattern="[0-9]*"
        value={value != null && !Number.isNaN(value) ? value : ""}
        onChange={onChange}
        className={`appearance-none overflow-hidden bg-transparent text-center outline-none [-moz-appearance:_textfield] focus:outline-none [&::-webkit-inner-spin-button]:m-0 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:m-0 [&::-webkit-outer-spin-button]:appearance-none ${current.input}`}
        min="0"
        disabled={!isEditable}
        placeholder="0"
        aria-label={isHearing ? "hearing attendance count" : "attendance count"}
      />

      {isEditable && (
        <Button
          size="sm"
          color="primary"
          variant="solid"
          onPress={onIncrement}
          className={`rounded-r-full bg-blue-600 text-slate-100 ${current.button}`}
          aria-label="Increase count"
        >
          <CirclePlus size={size === "lg" ? 28 : 17} />
        </Button>
      )}
    </div>
  );
};

export default AttendanceInputGroup;
