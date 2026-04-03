// AttendanceInputGroup.tsx (updated)
import React from "react";
import { Button } from "@heroui/react";
import { CircleMinus, CirclePlus } from "lucide-react";

interface AttendanceInputGroupProps {
  value: number | null;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isEditable: boolean;
  onIncrement: () => void;
  onDecrement: () => void;
  size?: "sm" | "lg"; // new size prop
  isHearing?: boolean;
}

const AttendanceInputGroup: React.FC<AttendanceInputGroupProps> = ({
  value,
  onChange,
  isEditable,
  onIncrement,
  onDecrement,
  size = "sm", // default to small (inline)
  isHearing = false,
}) => {
  // Size classes
  const sizeClasses = {
    sm: {
      button: "p-3 sm:p-2 md:h-[4rem] md:w-[8rem]",
      input: "w-20 text-4xl sm:w-[16vw] sm:max-w-[100px] sm:text-[8vw]",
    },
    lg: {
      button: "p-5 text-4xl w-20 h-20 sm:hidden", // extra large on mobile only
      input: "w-24 text-6xl",
    },
  };

  const current = sizeClasses[size];

  return (
    <div className="flex items-center justify-center gap-2 pb-4 sm:gap-0">
      {isEditable && (
        <Button
          size="sm"
          color="danger"
          variant="solid"
          onPress={onDecrement}
          className={`items-center rounded-l-full bg-red-600 text-slate-100 sm:hidden ${current.button}`}
          aria-label="Decrease count"
        >
          <CircleMinus size={size === "lg" ? 28 : 17} />
        </Button>
      )}

      {isEditable && (
        <input
          type="number"
          value={value ?? ""}
          onChange={onChange}
          className={`appearance-none bg-transparent text-center outline-none [-moz-appearance:_textfield] focus:outline-none [&::-webkit-inner-spin-button]:m-0 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:m-0 [&::-webkit-outer-spin-button]:appearance-none ${current.input}`}
          min="0"
          disabled={!isEditable}
          placeholder="0"
          aria-label="attendance count"
        />
      )}

      {isEditable && (
        <Button
          size="sm"
          color="primary"
          variant="solid"
          onPress={onIncrement}
          className={`sm:hiddenitems-center rounded-r-full bg-blue-600 text-slate-100 ${current.button}`}
          aria-label="Increase count"
        >
          <CirclePlus size={size === "lg" ? 28 : 17} />
        </Button>
      )}
    </div>
  );
};

export default AttendanceInputGroup;
