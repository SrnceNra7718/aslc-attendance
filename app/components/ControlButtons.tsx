import React from "react";
import CustomButton from "./ui/CustomButton";

interface ControlButtonsProps {
  isHovered: boolean;
  isEditable: boolean;
  onEdit: () => void;
  onCancel: () => void;
  onSubmit: () => void;
}

const ControlButtons: React.FC<ControlButtonsProps> = ({
  isHovered,
  isEditable,
  onEdit,
  onCancel,
  onSubmit,
}) => (
  <div className="absolute right-0 top-[0.5rem] flex gap-2 sm:right-3 sm:top-[1rem]">
    {isHovered && !isEditable && (
      <CustomButton
        iconType="pencil"
        title="Edit"
        onClick={onEdit}
        aria-label="Edit attendance"
      />
    )}

    {isEditable && (
      <>
        <CustomButton
          iconType="ban"
          title="Cancel"
          onClick={onCancel}
          className="max-sm:mr-[-1.5rem]"
          aria-label="Cancel changes"
        />
        <CustomButton
          iconType="save"
          title="Save"
          onClick={onSubmit}
          aria-label="Save attendance"
        />
      </>
    )}
  </div>
);

export default ControlButtons;
