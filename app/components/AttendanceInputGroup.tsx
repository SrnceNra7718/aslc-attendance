import React from "react";
import { Button } from "@nextui-org/react";
import { CircleMinus, CirclePlus } from "lucide-react";

interface AttendanceInputGroupProps {
  value: number | null;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isEditable: boolean;
  onIncrement: () => void;
  onDecrement: () => void;
  isHearing?: boolean;
}

const AttendanceInputGroup: React.FC<AttendanceInputGroupProps> = ({
  value,
  onChange,
  isEditable,
  onIncrement,
  onDecrement,
  isHearing = false,
}) => {
  // Button classes - fixed positioning only on mobile
  const buttonRedClasses =
    "bg-red-600 p-1 text-xs text-slate-100 rounded-l-full items-center " +
    "sm:p-2 sm:text-sm md:h-[4rem] md:w-[8rem] " +
    "fixed left-3 sm:left-auto sm:relative";

  const buttonBlueClasses =
    "bg-blue-600 p-1 text-xs text-slate-100 rounded-r-full items-center " +
    "sm:p-2 sm:text-sm md:h-[4rem] md:w-[8rem] " +
    "fixed right-3 sm:right-auto sm:relative";

  return (
    <div className="relative flex items-center justify-center">
      {/* Decrement button - fixed on mobile, inline on larger screens */}
      {isEditable && (
        <Button
          size="sm"
          color="danger"
          variant="solid"
          onClick={onDecrement}
          className={buttonRedClasses}
          aria-label="Decrease count"
        >
          <CircleMinus size={17} />
        </Button>
      )}

      {/* Input field - always centered */}
      <input
        type="number"
        value={value ?? ""}
        onChange={onChange}
        className="w-[16vw] max-w-[100px] appearance-none bg-transparent text-center text-[6vw] outline-none [-moz-appearance:_textfield] focus:outline-none sm:mx-2 [&::-webkit-inner-spin-button]:m-0 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:m-0 [&::-webkit-outer-spin-button]:appearance-none"
        min="0"
        disabled={!isEditable}
        placeholder="0"
        aria-label="attendance count"
      />

      {/* Increment button - fixed on mobile, inline on larger screens */}
      {isEditable && (
        <Button
          size="sm"
          color="primary"
          variant="solid"
          onClick={onIncrement}
          className={buttonBlueClasses}
          aria-label="Increase count"
        >
          <CirclePlus size={17} />
        </Button>
      )}
    </div>
  );
};

export default AttendanceInputGroup;
