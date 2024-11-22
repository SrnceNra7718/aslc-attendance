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
  const [timer, setTimer] = useState<NodeJS.Timeout | null>(null); // Holds the timer reference

  useEffect(() => {
    if (isButtonClicked && message) {
      setIsVisible(true); // Show log message if button is clicked

      // Clear any existing timer to reset the visibility duration
      if (timer) {
        clearTimeout(timer);
      }

      // Set a new timer for 3 seconds
      const newTimer = setTimeout(() => {
        setIsVisible(false); // Hide log message after 3 seconds
      }, 3000);
      setTimer(newTimer); // Update the timer reference
    }

    // Clear the timer on component unmount to avoid memory leaks
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [message, isButtonClicked]); // Re-run on message or button click change

  if (!isVisible) return null; // Render nothing if not visible

  return (
    <div className="fixed right-4 top-4 z-50 rounded bg-secondary px-4 py-2 text-foreground-900 shadow-lg fade-out">
      {message}
    </div>
  );
}
