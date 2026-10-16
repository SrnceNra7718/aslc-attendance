"use client";

import { useState, useEffect, useCallback } from "react";

type FullscreenElement = HTMLElement & {
  requestFullscreen?: (options?: {
    navigationUI?: "auto" | "hide" | "show";
  }) => Promise<void>;
};

export function useFullscreen() {
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Stay in sync with browser state (Esc key, OS gestures, etc.)
  useEffect(() => {
    const onChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);

  const enterFullscreen = useCallback(async () => {
    const el = document.documentElement as FullscreenElement;
    if (!el.requestFullscreen) return;
    try {
      // "hide" strips the URL bar / title bar / window buttons.
      await el.requestFullscreen({ navigationUI: "hide" });
      setIsFullscreen(true);
    } catch {
      /* gesture required or denied */
    }
  }, []);

const exitFullscreen = useCallback(async () => {
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      }
    } catch {
      /* ignore */
    }
    setIsFullscreen(false);
  }, []);

  const toggleFullscreen = useCallback(() => {
    if (document.fullscreenElement) void exitFullscreen();
    else void enterFullscreen();
  }, [enterFullscreen, exitFullscreen]);

  return { isFullscreen, enterFullscreen, exitFullscreen, toggleFullscreen };
}
