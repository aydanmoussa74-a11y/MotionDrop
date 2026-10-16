import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Tab = "html" | "css" | "js";

export interface EditorState {
  html: string;
  css: string;
  overlays: Overlay[];
  js: string;
  activeTab: Tab;
  fps: number;
  durationSec: number;
  exportFormat: "webm" | "mp4";
  isRecording: boolean;
  isExporting: boolean;
  exportProgress: number; // 0..1
  lastBlob: Blob | null;
  lastObjectUrl: string | null;
}

export interface Overlay { id: string; type: "text" | "shape"; x: number; y: number; w: number; h: number; text: string; }

const DEFAULT_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>MotionDrop</title>
  <style>
    /* Your CSS goes here */
  </style>
</head>
<body>
  <div class="stage">
    <h1 class="title">MotionDrop</h1>
    <p class="sub">HTML → MP4</p>
  </div>
  <script>
    /* Your JS goes here */
  </script>
</body>
</html>`;

const DEFAULT_CSS = `* { margin: 0; padding: 0; box-sizing: border-box; }

body {
  width: 100vw;
  height: 100vh;
  display: grid;
  place-items: center;
  background: #0A0A0C;
  font-family: system-ui, sans-serif;
  overflow: hidden;
}

.stage {
  text-align: center;
  color: #00E5FF;
}

.title {
  font-size: clamp(2rem, 9vw, 6rem);
  font-weight: 800;
  letter-spacing: -0.04em;
  text-transform: uppercase;
}

.sub {
  margin-top: 0.5rem;
  font-size: clamp(0.75rem, 2.5vw, 1.25rem);
  color: #9A9AA6;
  letter-spacing: 0.3em;
  text-transform: uppercase;
}`;

const DEFAULT_JS = `// Runs inside the preview pane.
// Use requestAnimationFrame for motion.

const title = document.querySelector('.title');
let t = 0;

function tick() {
  t += 0.02;
  title.style.transform = \`translateY(\${Math.sin(t) * 12}px)\`;
  requestAnimationFrame(tick);
}
requestAnimationFrame(tick);`;

interface EditorActions {
  setHtml: (v: string) => void;
  setCss: (v: string) => void;
  setJs: (v: string) => void;
  setActiveTab: (t: Tab) => void;
  setFps: (n: number) => void;
  addOverlay: (o: Overlay) => void;
  removeOverlay: (id: string) => void;
  moveOverlay: (id: string, x: number, y: number) => void;
  setDurationSec: (n: number) => void;
  setExportFormat: (f: EditorState["exportFormat"]) => void;
  setRecording: (b: boolean) => void;
  setExporting: (b: boolean) => void;
  setProgress: (n: number) => void;
  setLastBlob: (blob: Blob | null, url: string | null) => void;
  reset: () => void;
  loadTemplate: () => void;
}

type Store = EditorState & EditorActions;

const defaults: EditorState = {
  html: DEFAULT_HTML,
  css: DEFAULT_CSS,
  overlays: [],
  js: DEFAULT_JS,
  activeTab: "html",
  fps: 30,
  durationSec: 5,
  exportFormat: "webm",
  isRecording: false,
  isExporting: false,
  exportProgress: 0,
  lastBlob: null,
  lastObjectUrl: null,
};

export const useEditorStore = create<Store>()(
  persist(
    (set, get) => ({
      ...defaults,
      overlays: [],
      addOverlay: (o: Overlay) => set((s) => ({ overlays: [...s.overlays, o] })),
      removeOverlay: (id: string) => set((s) => ({ overlays: s.overlays.filter((o) => o.id !== id) })),
      moveOverlay: (id: string, x: number, y: number) =>
        set((s) => ({
          overlays: s.overlays.map((o) =>
            o.id === id ? { ...o, x, y } : o
          ),
        })),
      setHtml: (html) => set({ html }),
      setCss: (css) => set({ css }),
      setJs: (js) => set({ js }),
      setActiveTab: (activeTab) => set({ activeTab }),
      setFps: (fps) => set({ fps }),
      setDurationSec: (durationSec) => set({ durationSec }),
      setExportFormat: (exportFormat) => set({ exportFormat }),
      setRecording: (isRecording) => set({ isRecording }),
      setExporting: (isExporting) => set({ isExporting }),
      setProgress: (exportProgress) => set({ exportProgress }),
      setLastBlob: (lastBlob, lastObjectUrl) =>
        set({ lastBlob, lastObjectUrl }),
      reset: () => set({ ...defaults }),
      loadTemplate: () =>
        set({
          html: DEFAULT_HTML,
          css: DEFAULT_CSS,
          js: DEFAULT_JS,
          activeTab: "html",
        }),
    }),
    {
      name: "motiondrop-editor",
      partialize: (s) => ({
        html: s.html,
        css: s.css,
        js: s.js,
        activeTab: s.activeTab,
        fps: s.fps,
        durationSec: s.durationSec,
        exportFormat: s.exportFormat,
      }),
    },
  ),
);
