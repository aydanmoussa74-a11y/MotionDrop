"use client";

import React, { useEffect } from "react";
import { useHaptics } from "@/hooks/useHaptics";

interface BottomSheetProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export function BottomSheet({ open, onClose, children }: BottomSheetProps) {
  const { vibrate } = useHaptics();

  useEffect(() => {
    if (!open) return;
    vibrate("light");
    return () => {
      vibrate("selection");
    };
  }, [open, vibrate]);

  if (!open) return null;

  return (
    <>
      <div
        className="sheet-backdrop fixed inset-0 z-[50] bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div
        className="sheet-panel fixed left-0 right-0 bottom-0 z-[60] w-full bg-ink-800 border-t border-stark-line pt-safe pb-6 px-6 max-h-[85vh] overflow-y-auto stark-scrollbar"
        role="dialog"
        aria-modal="true"
      >
        <div className="w-10 h-1 mx-auto mb-4 rounded-full bg-ink-500" />
        <div className="px-2">{children}</div>
      </div>
    </>
  );
}
