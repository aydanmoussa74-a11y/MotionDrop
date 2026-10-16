"use client";

import React, { useRef, useCallback } from "react";
import { useEditorStore } from "@/stores/editorStore";
import { PreviewPane } from "@/components/PreviewPane";
import { CodeEditor } from "@/components/CodeEditor";
import { BottomSheet } from "@/components/BottomSheet";
import { ExportSheet } from "@/components/ExportSheet";
import { useHaptics } from "@/hooks/useHaptics";

export default function EditorPage() {
  const { activeTab, isExporting, isRecording, setActiveTab } = useEditorStore(
    (s) => ({
      activeTab: s.activeTab,
      isExporting: s.isExporting,
      isRecording: s.isRecording,
      setActiveTab: s.setActiveTab,
    }),
  );
  const [showExport, setShowExport] = React.useState(false);

  const { vibrate } = useHaptics();

  const handleExportPress = useCallback(() => {
    vibrate("light");
    setShowExport(true);
  }, [vibrate]);

  const handleCloseExport = useCallback(() => {
    setShowExport(false);
  }, []);

  return (
    <div className="min-h-screen bg-ink-900 text-stark-white">
      {/* ============ FLOATING TOP BAR ============ */}
      <header className="fixed top-0 left-0 right-0 z-[40] pt-safe px-4 pb-2">
        <div className="flex items-center justify-between">
          <div className="font-display font-bold text-2xl tracking-tighter text-stark-white">
            MOTIONDROP
          </div>
          <button
            onClick={handleExportPress}
            disabled={isExporting || isRecording}
            className={`flex items-center gap-2 px-4 py-2 rounded-sm text-xs font-bold uppercase tracking-wider transition-colors pressable-accent disabled:opacity-40 disabled:pointer-events-none ${
              isExporting || isRecording
                ? "bg-ink-600 text-ink-300 shadow-hard"
                : "bg-accent text-ink-900 shadow-hard-accent"
            }`}
          >
            {isRecording ? "RECORDING…" : (isExporting ? "EXPORTING…" : "EXPORT")}
          </button>
        </div>
      </header>

      {/* ============ PREVIEW PANE (TOP 55%) ============ */}
      <main className="pt-safe pb-safe">
        <div
          className="w-full h-[55vh] border-b border-stark-line border-b-4 bg-ink-800 relative overflow-hidden"
        >
          <PreviewPane className="w-full h-full" />
          {/* Recording indicator overlay */}
          {isRecording && (
            <div className="absolute top-4 left-4 z-[10] flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulseDot" />
              <span className="font-mono text-xs font-bold text-red-500 uppercase tracking-wider">
                REC
              </span>
            </div>
          )}
        </div>

        {/* ============ CODE EDITOR (BOTTOM 45%) ============ */}
        <div className="w-full h-[45vh] bg-ink-900 border-t border-stark-line border-t-4">
          <CodeEditor
            activeTab={activeTab}
            onTabChange={setActiveTab}
          />
        </div>
      </main>

      {/* ============ FLOATING BOTTOM TOOLBAR ============ */}
      <footer className="fixed bottom-0 left-0 right-0 z-[40] pb-safe px-4 pt-3">
        <div className="flex items-center justify-between gap-3">
          <button
            onClick={() => setActiveTab("html")}
            className={`flex-1 flex flex-col items-center gap-1 py-2 px-2 text-xs font-bold uppercase tracking-wider transition-colors pressable ${
              activeTab === "html"
                ? "text-accent"
                : "text-ink-400 hover:text-stark-white"
            }`}
            aria-pressed={activeTab === "html"}
          >
            <span className={`w-4 h-4 border rounded border-stark-line ${
              activeTab === "html" ? "bg-accent border-accent" : "bg-ink-800"
            }`} />
            <span>HTML</span>
          </button>
          <button
            onClick={() => setActiveTab("css")}
            className={`flex-1 flex flex-col items-center gap-1 py-2 px-2 text-xs font-bold uppercase tracking-wider transition-colors pressable ${
              activeTab === "css"
                ? "text-accent"
                : "text-ink-400 hover:text-stark-white"
            }`}
            aria-pressed={activeTab === "css"}
          >
            <span className={`w-4 h-4 border rounded border-stark-line ${
              activeTab === "css" ? "bg-accent border-accent" : "bg-ink-800"
            }`} />
            <span>CSS</span>
          </button>
          <button
            onClick={() => setActiveTab("js")}
            className={`flex-1 flex flex-col items-center gap-1 py-2 px-2 text-xs font-bold uppercase tracking-wider transition-colors pressable ${
              activeTab === "js"
                ? "text-accent"
                : "text-ink-400 hover:text-stark-white"
            }`}
            aria-pressed={activeTab === "js"}
          >
            <span className={`w-4 h-4 border rounded border-stark-line ${
              activeTab === "js" ? "bg-accent border-accent" : "bg-ink-800"
            }`} />
            <span>JS</span>
          </button>
        </div>
      </footer>

      {/* ============ EXPORT BOTTOM SHEET ============ */}
      <BottomSheet open={showExport} onClose={handleCloseExport}>
        <ExportSheet open={showExport} onClose={handleCloseExport} />
      </BottomSheet>
    </div>
  );
}
