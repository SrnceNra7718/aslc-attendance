// CustomButton.tsx
import React, { useState } from "react";
import { Button } from "@nextui-org/button";
import { Ban, CircleMinus, CirclePlus, Pencil, Save } from "lucide-react"; // Import the icons

interface CustomButtonProps {
  iconType: "ban" | "pencil" | "save" | "add" | "minus"; // Determine the type of icon to display
  title?: string; // Title to display next to the icon
  onClick: () => void; // Function to call on button click
  className?: string; // Optional className for additional styles
}

const CustomButton: React.FC<CustomButtonProps> = ({
  iconType,
  title = "",
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
      case "add":
        return <CirclePlus size={16} />;
      case "minus":
        return <CircleMinus size={16} />;

      default:
        return null; // Fallback if no valid iconType is provided
    }
  };

  return (
    <div className="scale-50 sm:scale-80 md:scale-100 lg:scale-100">
      <Button
        variant="light"
        color={
          iconType === "ban" || iconType === "minus" ? "danger" : "primary"
        }
        className={`relative flex items-center text-white transition-all duration-300 ease-in-out ${
          iconType === "ban" || iconType === "minus"
            ? "bg-red-600"
            : "bg-blue-600"
        } ${className}`} // Responsive scaling for different screen sizes
        onMouseEnter={() => setIsHovered(true)} // Track hover state
        onMouseLeave={() => setIsHovered(false)} // Reset hover state
        onClick={onClick} // Handle click
      >
        {renderIcon()}
        {isHovered && (
          <span
            className={`font-semibold transition-opacity delay-150 duration-300 ease-in-out ${
              isHovered ? "opacity-100" : "opacity-0" // Smooth transition for text opacity
            }`}
          >
            {title}
          </span>
        )}
      </Button>
    </div>
  );
};

export default CustomButton;
