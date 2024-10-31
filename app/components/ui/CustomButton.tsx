// CustomButton.tsx
import React, { useState } from "react";
import { Button } from "@nextui-org/button";
import { Ban, Pencil, Save } from "lucide-react"; // Import the icons

interface CustomButtonProps {
  iconType: "ban" | "pencil" | "save"; // Determine the type of icon to display
  title: string; // Title to display next to the icon
  onClick: () => void; // Function to call on button click
  className?: string; // Optional className for additional styles
}

const CustomButton: React.FC<CustomButtonProps> = ({
  iconType,
  title,
  onClick,
  className,
}) => {
  const [isHovered, setIsHovered] = useState(false); // State to track hover status

  // Function to determine which icon to display based on iconType
  const renderIcon = () => {
    switch (iconType) {
      case "ban":
        return <Ban size={16} />;
      case "save":
        return <Save size={16} />;
      case "pencil":
        return <Pencil size={16} />;
      default:
        return null; // Fallback if no valid iconType is provided
    }
  };

  return (
    <Button
      variant="light"
      color={iconType === "ban" ? "danger" : "primary"}
      className={`relative flex items-center rounded p-2 text-white transition-all duration-300 ease-in-out ${
        iconType === "ban" ? "bg-red-600" : "bg-blue-500"
      } ${className}`} // Change button background color based on iconType
      onMouseEnter={() => setIsHovered(true)} // Track hover state
      onMouseLeave={() => setIsHovered(false)} // Reset hover state
      onClick={onClick} // Handle click
      startContent={renderIcon()}
    >
      {isHovered && (
        <span
          className={`ml-1 font-semibold transition-opacity delay-150 duration-300 ease-in-out ${
            isHovered ? "opacity-100" : "opacity-0" // Smooth transition for text opacity
          }`}
        >
          {title}
        </span>
      )}
    </Button>
  );
};

export default CustomButton;
