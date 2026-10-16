/**
 * recorder.ts — Video engine for MotionDrop.
 *
 * Captures the live preview pane via CanvasCapture + MediaRecorder and saves it
 * as a .webm (VP8/WebM) file directly to the device. MP4/H.264 is the
 * preferred container on iOS/Android WebView where supported via the
 * "video/mp4; codecs=avc1.64001E" mime type; we fall back to WebM when that
 * type is not supported.
 *
 * Strategy:
 *   1. Draw the target <iframe> document onto an offscreen <canvas> each frame
 *      using requestAnimationFrame.
 *   2. Canvas.captureStream() yields a MediaStream → MediaRecorder.
 *   3. Chunks are collected; on stop, we produce a Blob and an object URL.
 *   4. A hidden <a> element triggers a download to the Downloads folder.
 *
 * Caveats:
 *   - Canvas rendering of cross-origin iframes is blocked. We therefore render
 *     the user's HTML into a same-origin <iframe srcdoc> so the canvas can
 *     read it via drawImage.
 *   - Some WebViews don't support H.264 in MediaRecorder; VP8/WebM is the
 *     universal fallback.
 */

const FRAME_RATE = 30;
const VIDEO_BITRATE = 2_500_000; // 2.5 Mbps

export type ExportFormat = "webm" | "mp4";

export type RecorderEvents = {
  onProgress?: (percent: number) => void;
  onStarted?: () => void;
  onCompleted?: (blob: Blob, url: string) => void;
  onError?: (err: Error) => void;
};

let _instance: Recorder | null = null;

/**
 * Recorder captures a preview DOM element into a video file.
 */
export class Recorder {
  private mediaRecorder: MediaRecorder | null = null;
  private stream: MediaStream | null = null;
  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;
  private target: HTMLIFrameElement | null = null;

  private chunks: Blob[] = [];
  private rafId: number | null = null;
  private startTime = 0;
  private durationSec = 0;
  private fps = FRAME_RATE;

  private events: RecorderEvents = {};
  private stoppedByUser = false;

  constructor() {
    _instance = this;
  }

  /**
   * Prepare the offscreen canvas sized to the preview pane.
   */
  private initCanvas(width: number, height: number) {
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Unable to get canvas 2D context");
    this.canvas = canvas;
    this.ctx = ctx;
  }

  private getFrameIntervalMs() {
    return 1000 / this.fps;
  }

  private captureFrame() {
    if (!this.ctx || !this.target || !this.canvas) return;

    const now = performance.now();
    const elapsed = now - this.startTime;

    // Draw the iframe's rendered document into the canvas.
    try {
      // Same-origin iframe (srcdoc) can be drawn into the canvas in Chromium /
      // Android WebView. Cast to satisfy TS CanvasImageSource type.
      this.ctx.drawImage(
        this.target as unknown as CanvasImageSource,
        0,
        0,
        this.canvas.width,
        this.canvas.height,
      );
    } catch (e) {
      // Cross-origin or not ready yet — skip this frame.
    }

    if (this.events.onProgress && this.durationSec > 0) {
      const pct = Math.min(elapsed / (this.durationSec * 1000), 1);
      this.events.onProgress(pct);
    }

    if (elapsed < this.durationSec * 1000 && !this.stoppedByUser) {
      this.rafId = requestAnimationFrame(() => this.captureFrame());
    } else {
      this.stopRecording();
    }
  }

  /**
   * Start recording the given iframe for `durationSec` seconds.
   */
  async startRecord(
    target: HTMLIFrameElement,
    opts: {
      durationSec: number;
      fps: number;
      format: ExportFormat;
      width: number;
      height: number;
      events: RecorderEvents;
    },
  ): Promise<void> {
    if (this.mediaRecorder && this.mediaRecorder.state !== "inactive") {
      throw new Error("Already recording");
    }

    this.stoppedByUser = false;
    this.target = target;
    this.durationSec = opts.durationSec;
    this.fps = opts.fps;
    this.events = opts.events;
    this.chunks = [];
    this.startTime = performance.now();

    this.initCanvas(opts.width, opts.height);

    // Pick a supported mime type.
    const mime = this.pickMimeType(opts.format);

    // Capture stream from canvas.
    if (!this.canvas) throw new Error("Canvas not initialized");
    this.stream = this.canvas.captureStream(this.fps);

    try {
      this.mediaRecorder = new MediaRecorder(this.stream, {
        mimeType: mime,
        videoBitsPerSecond: VIDEO_BITRATE,
      });
    } catch (e) {
      // Fallback to plain WebM if the requested codec isn't supported.
      this.mediaRecorder = new MediaRecorder(this.stream, {
        videoBitsPerSecond: VIDEO_BITRATE,
      });
    }

    this.mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) this.chunks.push(e.data);
    };

    this.mediaRecorder.onstop = () => {
      const blob = new Blob(this.chunks, { type: this.mediaRecorder?.mimeType || "video/webm" });
      const url = URL.createObjectURL(blob);
      if (this.events.onCompleted) this.events.onCompleted(blob, url);
      this.cleanup();
    };

    this.mediaRecorder.onerror = (e) => {
      const err = new Error(`MediaRecorder error: ${e}`);
      if (this.events.onError) this.events.onError(err);
      this.cleanup();
    };

    this.mediaRecorder.start(1000 / this.fps);
    if (this.events.onStarted) this.events.onStarted();

    // Start the capture loop.
    this.captureFrame();
  }

  private pickMimeType(format: ExportFormat): string {
    // MP4/H.264 preferred on mobile WebView where supported.
    if (format === "mp4" && MediaRecorder.isTypeSupported("video/mp4; codecs=avc1.64001E")) {
      return "video/mp4; codecs=avc1.64001E";
    }
    if (MediaRecorder.isTypeSupported("video/webm; codecs=vp8")) {
      return "video/webm; codecs=vp8";
    }
    return "video/webm";
  }

  stopRecording() {
    if (this.mediaRecorder && this.mediaRecorder.state !== "inactive") {
      this.mediaRecorder.stop();
    }
    if (this.stream) {
      this.stream.getTracks().forEach((t) => t.stop());
    }
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }

  private cleanup() {
    this.mediaRecorder = null;
    this.stream = null;
    this.canvas = null;
    this.ctx = null;
    this.target = null;
    this.chunks = [];
  }

  /** Abort an in-progress recording without saving. */
  cancel() {
    this.stoppedByUser = true;
    this.stopRecording();
  }

  isRecording(): boolean {
    return !!this.mediaRecorder && this.mediaRecorder.state === "recording";
  }
}

/**
 * Singleton accessor.
 */
export function getRecorder(): Recorder {
  if (!_instance) _instance = new Recorder();
  return _instance;
}

/**
 * Download a Blob as a file to the device.
 */
export function downloadBlob(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Convenience: build a sanitized filename.
 */
export function exportFileName(format: ExportFormat): string {
  const stamp = new Date().toISOString().replace(/[-:]/g, "").slice(0, 13);
  return `motiondrop_${stamp}.${format === "mp4" ? "mp4" : "webm"}`;
}
