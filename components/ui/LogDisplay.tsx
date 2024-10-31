// LogDisplay.tsx
import React, { useEffect, useState } from "react";

type LogDisplayProps = {
  message: string; // Message to display
};

export default function LogDisplay({ message }: LogDisplayProps) {
  const [isVisible, setIsVisible] = useState(true); // State to manage visibility

  useEffect(() => {
    // Timeout to hide message after 3 seconds
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, 3000);

    // Clean up timeout when component unmounts or message changes
    return () => clearTimeout(timer);
  }, [message]);

  if (!isVisible) return null; // Don't render if not visible

  return (
    <div className="fixed right-4 top-4 rounded bg-secondary px-4 py-2 text-foreground-900 shadow-lg fade-out">
      {message}
    </div>
  );
}
