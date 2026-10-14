"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Minimize2, Maximize2, X, Monitor } from "lucide-react";
import { Button } from "./button";

interface PictureInPictureProps {
  pipWindow: Window | null;
  onClose: () => void;
  onFocus: () => void;
}

export default function PictureInPicture({
  pipWindow,
  onClose,
  onFocus,
}: PictureInPictureProps) {
  if (!pipWindow) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex items-center gap-2" suppressHydrationWarning>
      <div className="flex items-center gap-2 bg-card border border-border rounded-lg shadow-lg p-2">
        <span className="text-xs font-medium text-muted-foreground flex items-center gap-1">
          <Monitor className="h-3 w-3" />
          Fullscreen Display
        </span>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={onFocus}
            aria-label="Focus fullscreen window"
            title="Focus window"
          >
            <Maximize2 className="h-3 w-3" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={onClose}
            aria-label="Close fullscreen window"
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      </div>
    </div>
  );
}

export function usePictureInPicture() {
  const [pipWindow, setPipWindow] = useState<Window | null>(null);
  const pipWindowRef = useRef<Window | null>(null);

  // Keep ref in sync with state
  useEffect(() => {
    pipWindowRef.current = pipWindow;
  }, [pipWindow]);

  const buildPiPUrl = useCallback(
    (params: {
      meetingInfo?: string;
      inputDate?: string;
      dValue?: number | null;
      hValue?: number | null;
      remarks?: string | null;
    }) => {
      const baseUrl = `${window.location.origin}/pip`;
      const searchParams = new URLSearchParams();
      searchParams.set("pip", "true");
      if (params.meetingInfo) searchParams.set("meetingInfo", params.meetingInfo);
      if (params.inputDate) searchParams.set("inputDate", params.inputDate);
      if (params.dValue !== undefined) searchParams.set("dValue", String(params.dValue));
      if (params.hValue !== undefined) searchParams.set("hValue", String(params.hValue));
      if (params.remarks) searchParams.set("remarks", params.remarks);
      return `${baseUrl}?${searchParams.toString()}`;
    },
    []
  );

  const openPiPWindow = useCallback(
    async (params: {
      meetingInfo?: string;
      inputDate?: string;
      dValue?: number | null;
      hValue?: number | null;
      remarks?: string | null;
    }) => {
      // Use ref to get current window (avoids stale closure)
      const currentWindow = pipWindowRef.current;
      if (currentWindow && !currentWindow.closed) {
        currentWindow.focus();
        return;
      }

      const url = buildPiPUrl(params);

      // Use fullscreen window.open to cover entire second display
      // Calculate screen dimensions for fullscreen
      const width = window.screen.width;
      const height = window.screen.height;
      const left = window.screenX || window.screenLeft || 0;
      const top = window.screenY || window.screenTop || 0;

      // Try to position on second display if available
      // For multi-monitor setups, try offsetting by primary screen width
      const screenLeft = left + (width > height ? width : 0);

      const newWindow = window.open(
        url,
        "attendance-pip",
        `width=${width},height=${height},left=${screenLeft},top=${top},menubar=no,toolbar=no,location=no,status=no,resizable=no,scrollbars=no,fullscreen=yes`
      );

      if (newWindow) {
        // Request fullscreen on the new window
        try {
          newWindow.moveTo(screenLeft, top);
          newWindow.resizeTo(width, height);
        } catch {
          // Ignore move/resize errors
        }
        pipWindowRef.current = newWindow;
        setPipWindow(newWindow);
        return;
      }
    },
    [buildPiPUrl]
  );

  const closePiPWindow = useCallback(() => {
    const currentWindow = pipWindowRef.current;
    if (currentWindow) {
      try {
        currentWindow.close();
      } catch {
        // Ignore errors
      }
      setPipWindow(null);
      pipWindowRef.current = null;
    }
  }, []);

  const focusPiPWindow = useCallback(() => {
    const currentWindow = pipWindowRef.current;
    if (currentWindow && !currentWindow.closed) {
      currentWindow.focus();
    }
  }, []);

  useEffect(() => {
    return () => {
      const currentWindow = pipWindowRef.current;
      if (currentWindow) {
        try {
          currentWindow.close();
        } catch {
          // Ignore errors
        }
      }
    };
  }, []);

  return {
    pipWindow,
    openPiPWindow,
    closePiPWindow,
    focusPiPWindow,
  };
}