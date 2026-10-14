"use client";

import { useEffect, useState } from "react";
import AttendanceForm from "@/app/components/AttendanceForm";

export default function PiPPage() {
  const [isPiP, setIsPiP] = useState(false);
  const [initialProps, setInitialProps] = useState<{
    initialInputDate?: string;
    initialDValue?: number | null;
    initialHValue?: number | null;
    initialRemarks?: string | null;
    isPiP?: boolean;
    readOnly?: boolean;
  }>({});

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get("pip") === "true") {
      setIsPiP(true);
      const dValue = urlParams.get("dValue");
      const hValue = urlParams.get("hValue");
      setInitialProps({
        initialInputDate: urlParams.get("inputDate") || undefined,
        initialDValue: dValue && dValue !== "" ? parseInt(dValue, 10) : undefined,
        initialHValue: hValue && hValue !== "" ? parseInt(hValue, 10) : undefined,
        initialRemarks: urlParams.get("remarks") || undefined,
        isPiP: true,
        readOnly: true,
      });
      
      // Remove all browser chrome styles
      document.body.style.margin = "0";
      document.body.style.padding = "0";
      document.body.style.overflow = "hidden";
      document.body.style.backgroundColor = "var(--background)";
      document.body.style.color = "var(--foreground)";
      document.body.style.width = "100vw";
      document.body.style.height = "100vh";
      document.documentElement.style.margin = "0";
      document.documentElement.style.padding = "0";
      document.documentElement.style.overflow = "hidden";
      document.documentElement.style.width = "100vw";
      document.documentElement.style.height = "100vh";
      
      // Request fullscreen
      if (document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen().catch(() => {
          // Ignore if fullscreen request fails
        });
      }
    }
  }, []);

  if (!isPiP) {
    return null;
  }

  return (
    <div
      className="flex items-center justify-center w-full h-full bg-card"
      style={{ width: "100vw", height: "100vh", minHeight: "100vh" }}
      suppressHydrationWarning
    >
      <AttendanceForm {...initialProps} />
    </div>
  );
}