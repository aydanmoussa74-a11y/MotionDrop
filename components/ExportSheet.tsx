"use client";

import React, { useCallback } from "react";
import { useEditorStore } from "@/stores/editorStore";
import { getRecorder, downloadBlob, exportFileName } from "@/lib/recorder";
import { useHaptics } from "@/hooks/useHaptics";

export function ExportSheet({
  open,
  onClose,
  previewRef,
}: {
  open: boolean;
  onClose: () => void;
  previewRef: React.RefObject<HTMLIFrameElement>;
}) {
  const { vibrate } = useHaptics();
  const { durationSec, fps, exportFormat, isRecording, isExporting, exportProgress, setRecording, setExporting, setProgress, lastObjectUrl, setLastBlob } = useEditorStore((s) => ({
    durationSec: s.durationSec,
    fps: s.fps,
    exportFormat: s.exportFormat,
    isRecording: s.isRecording,
    isExporting: s.isExporting,
    exportProgress: s.exportProgress,
    lastObjectUrl: s.lastObjectUrl,
    setRecording: s.setRecording,
    setExporting: s.setExporting,
    setProgress: s.setProgress,
    setLastBlob: s.setLastBlob,
  }));
  const setExportFormat = useEditorStore((s) => s.setExportFormat);
  const setDurationSec = useEditorStore((s) => s.setDurationSec);
  const setFps = useEditorStore((s) => s.setFps);

  const handleExport = useCallback(async () => {
    const iframe = previewRef.current;
    if (!iframe) return;

    setRecording(true);
    setExporting(true);
    setProgress(0);
    vibrate("medium");

    try {
      await getRecorder().startRecord(iframe, {
        durationSec,
        fps,
        format: exportFormat,
        width: iframe.clientWidth,
        height: iframe.clientHeight,
        events: {
          onStarted: () => {},
          onProgress: (p) => setProgress(p),
          onCompleted: (blob, url) => {
            setLastBlob(blob, url);
            setRecording(false);
            setExporting(false);
            setProgress(1);
            vibrate("success");
            // Trigger download
            downloadBlob(blob, exportFileName(exportFormat));
            onClose();
          },
          onError: (err) => {
            console.error(err);
            setRecording(false);
            setExporting(false);
            vibrate("error");
            alert("Export failed. Try WebM format.");
          },
        },
      });
    } catch (err) {
      console.error(err);
      setRecording(false);
      setExporting(false);
      vibrate("error");
    }
  }, [durationSec, fps, exportFormat, setRecording, setExporting, setProgress, setLastBlob, vibrate, onClose]);

  return (
    <div className="space-y-5">
      <h2 className="font-display font-bold text-2xl tracking-tight text-stark-white">Export video</h2>

      <div className="space-y-3">
        <label className="font-bold text-xs uppercase tracking-widest text-ink-300">Format</label>
        <div className="flex gap-2 border border-stark-line bg-ink-900 p-1">
          <button
            onClick={() => setExportFormat("webm")}
            className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider transition-colors ${
              exportFormat === "webm"
                ? "bg-accent text-ink-900 shadow-hard-accent"
                : "text-ink-100 hover:text-accent"
            }`}
          >
            WEBM
          </button>
          <button
            onClick={() => setExportFormat("mp4")}
            className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider transition-colors ${
              exportFormat === "mp4"
                ? "bg-accent text-ink-900 shadow-hard-accent"
                : "text-ink-100 hover:text-accent"
            }`}
          >
            MP4
          </button>
        </div>
      </div>

      <div className="space-y-3">
        <label className="font-bold text-xs uppercase tracking-widest text-ink-300">Duration (sec)</label>
        <input
          type="number"
          min="1"
          max="60"
          value={durationSec}
          onChange={(e) => setDurationSec(Math.min(60, Math.max(1, Number(e.target.value) || 1)))}
          className="w-full py-2 px-3 bg-ink-900 border border-stark-line text-stark-white font-mono text-sm outline-none focus:border-accent"
        />
      </div>

      <div className="space-y-3">
        <label className="font-bold text-xs uppercase tracking-widest text-ink-300">FPS</label>
        <div className="flex gap-2">
          {[24, 30, 60].map((f) => (
            <button
              key={f}
              onClick={() => setFps(f)}
              className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider transition-colors border border-stark-line ${
                fps === f
                  ? "bg-accent text-ink-900 shadow-hard-accent"
                  : "bg-ink-900 text-ink-100 hover:text-accent"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {isRecording && (
        <div className="flex items-center gap-3 border border-stark-line bg-ink-900 p-3">
          <span className="w-2 h-2 rounded-full bg-red-500 animate-pulseDot" />
          <span className="font-mono text-sm text-accent">Recording {durationSec}s…</span>
        </div>
      )}

      {isExporting && exportProgress < 1 && (
        <div className="space-y-2">
          <div className="flex justify-between text-xs">
            <span className="text-ink-300">Exporting</span>
            <span className="font-mono text-accent">{Math.round(exportProgress * 100)}%</span>
          </div>
          <div className="w-full h-1 bg-ink-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-accent"
              style={{ width: `${exportProgress * 100}%` }}
            />
          </div>
        </div>
      )}

      <div className="border-t border-stark-line pt-4 flex gap-2">
        <button
          onClick={onClose}
          className="flex-1 py-3 text-center font-bold text-sm uppercase tracking-wider text-ink-300 hover:text-stark-white transition-colors pressable"
        >
          Cancel
        </button>
        <button
          onClick={handleExport}
          disabled={isRecording || isExporting}
          className="flex-1 py-3 text-center font-bold text-sm uppercase tracking-wider bg-accent text-ink-900 shadow-hard-accent pressable-accent disabled:opacity-50 disabled:pointer-events-none"
        >
          {isRecording ? "Recording…" : "Export video"}
        </button>
      </div>
    </div>
  );
}
