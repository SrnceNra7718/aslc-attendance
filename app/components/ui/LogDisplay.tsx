// LogDisplay.tsx
import React, { useEffect, useState } from "react";

type LogDisplayProps = {
  message: string; // Message to display
  isButtonClicked: boolean; // Indicates if the button has been clicked
};

export default function LogDisplay({
  message,
  isButtonClicked,
}: LogDisplayProps) {
  const [isVisible, setIsVisible] = useState(false); // Manages the visibility state

  useEffect(() => {
    if (isButtonClicked) {
      setIsVisible(true); // Display log message if button is clicked
    }

    const timer = setTimeout(() => {
      setIsVisible(false); // Hide log message after 3 seconds
    }, 3000);

    return () => clearTimeout(timer); // Clear timeout on cleanup
  }, [message, isButtonClicked]);

  if (!isVisible) return null; // Render nothing if not visible

  return (
    <div className="fixed right-4 top-4 rounded bg-secondary px-4 py-2 text-foreground-900 shadow-lg fade-out">
      {message}
    </div>
  );
}
