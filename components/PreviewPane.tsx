"use client";

import React, { useEffect, useRef, useCallback, useImperativeHandle } from "react";
import { useEditorStore } from "@/stores/editorStore";

type PreviewPaneProps = { className?: string; ref?: React.Ref<HTMLIFrameElement> };

/**
 * PreviewPane — renders the user's HTML/CSS/JS into a same-origin iframe.
 * Includes a floating Asset Bar for adding draggable text/shape overlays.
 *
 * Drag-and-drop uses a postMessage bridge: native pointer events inside the
 * iframe srcdoc dispatch MOVE_OVERLAY messages to the parent, which updates
 * the Zustand store and re-renders the srcdoc with new absolute positions.
 */
const PreviewPane = React.forwardRef<HTMLIFrameElement, PreviewPaneProps>(
  ({ className = "", ref }, forwardedRef) => {
    const { html, css, js } = useEditorStore((s) => ({
      html: s.html,
      css: s.css,
      js: s.js,
    }));
    const overlays = useEditorStore((s) => s.overlays);
    const addOverlay = useEditorStore((s) => s.addOverlay);
    const moveOverlay = useEditorStore((s) => s.moveOverlay);
    const iframeRef = useRef<HTMLIFrameElement>(null);

    useImperativeHandle(ref, () => iframeRef.current!);

    // Listen for drag-end messages from inside the iframe.
    useEffect(() => {
      const handleMessage = (event: MessageEvent) => {
        if (event.data?.type !== "MOVE_OVERLAY") return;
        const { id, x, y } = event.data;
        if (typeof id === "string" && typeof x === "number" && typeof y === "number") {
          moveOverlay(id, x, y);
        }
      };
      window.addEventListener("message", handleMessage);
      return () => window.removeEventListener("message", handleMessage);
    }, [moveOverlay]);

    // Drag script injected into the iframe srcdoc. Uses native pointer events
    // (works for mouse and mobile touch) and reports final positions via
    // postMessage to the parent window.
    const dragScript = `
(function() {
  var activeEl = null;
  var startX = 0;
  var startY = 0;
  var startLeft = 0;
  var startTop = 0;

  function getEls() {
    return document.querySelectorAll('.motiondrop-overlay');
  }

  function attach() {
    getEls().forEach(function(el) {
      el.removeEventListener('pointerdown', onDown);
      el.addEventListener('pointerdown', onDown);
    });
  }

  function onDown(e) {
    e.preventDefault();
    activeEl = e.currentTarget;
    startX = e.clientX;
    startY = e.clientY;
    var rect = activeEl.getBoundingClientRect();
    startLeft = rect.left;
    startTop = rect.top;
    activeEl.setPointerCapture(e.pointerId);
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    window.addEventListener('pointercancel', onUp);
  }

  function onMove(e) {
    if (!activeEl) return;
    e.preventDefault();
    var dx = e.clientX - startX;
    var dy = e.clientY - startY;
    var newLeft = startLeft + dx;
    var newTop = startTop + dy;
    activeEl.style.left = newLeft + 'px';
    activeEl.style.top = newTop + 'px';
  }

  function onUp(e) {
    if (!activeEl) return;
    window.removeEventListener('pointermove', onMove);
    window.removeEventListener('pointerup', onUp);
    window.removeEventListener('pointercancel', onUp);
    var rect = activeEl.getBoundingClientRect();
    window.parent.postMessage({
      type: 'MOVE_OVERLAY',
      id: activeEl.dataset.id,
      x: Math.round(rect.left),
      y: Math.round(rect.top),
    }, '*');
    activeEl.releasePointerCapture(e.pointerId);
    activeEl = null;
  }

  attach();
  // Re-attach whenever the DOM is updated (srcdoc re-render).
  var observer = new MutationObserver(attach);
  observer.observe(document.body, { childList: true, subtree: true });
})();
`;

    const buildDoc = useCallback(() => {
      const overlaysCss = overlays
        .map(
          (o) => `
        #motiondrop-overlay-${o.id} {
          position: absolute;
          left: ${o.x}px;
          top: ${o.y}px;
          width: ${o.w}px;
          height: ${o.h}px;
          background: rgba(0, 229, 255, 0.12);
          border: 2px solid #00E5FF;
          color: #00E5FF;
          font-family: system-ui, sans-serif;
          font-weight: 800;
          font-size: clamp(0.75rem, 2vw, 1.25rem);
          display: grid;
          place-items: center;
          text-align: center;
          user-select: none;
          pointer-events: auto;
          z-index: 10;
          touch-action: none;
        }
        #motiondrop-overlay-${o.id}:active {
          background: rgba(0, 229, 255, 0.28);
          border-color: #FFFFFF;
          transform: translateY(2px);
        }
      `,
        )
        .join("");
      const overlaysHtml = overlays
        .map(
          (o) =>
            `<div class="motiondrop-overlay" id="motiondrop-overlay-${o.id}" data-id="${o.id}">${o.text}</div>`,
        )
        .join("");
      const escapedCss = css.replace(/<\/style>/gi, "<\\/style>");
      const escapedJs = js.replace(/<\/script>/gi, "<\\/script>");
      return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Preview</title>
<style>
html, body { width: 100%; height: 100%; margin: 0; overflow: hidden; background: #0A0A0C; }
${escapedCss}
${overlaysCss}
</style>
</head>
<body>
${html}
${overlaysHtml}
<script>
${escapedJs}
</script>
<script>
${dragScript}
</script>
</body>
</html>`;
    }, [html, css, js, overlays, dragScript]);

    useEffect(() => {
      const iframe = iframeRef.current;
      if (!iframe || !iframe.contentDocument) return;
      iframe.srcdoc = buildDoc();
    }, [buildDoc]);

    const handleAddText = () => {
      const id = `overlay_${Date.now()}`;
      addOverlay({
        id,
        type: "text",
        x: 60,
        y: 60,
        w: 160,
        h: 56,
        text: "Drag me",
      });
    };

    const handleAddShape = () => {
      const id = `overlay_${Date.now()}`;
      addOverlay({
        id,
        type: "shape",
        x: 260,
        y: 60,
        w: 80,
        h: 80,
        text: "",
      });
    };

    return (
      <div className={`w-full h-full overflow-hidden bg-ink-900 relative ${className}`}>
        {/* Asset Bar — floating toolbar at top of preview */}
        <div className="absolute top-4 left-4 z-[20] flex gap-2">
          <button
            onClick={handleAddText}
            className="px-3 py-1.5 border border-stark-line bg-ink-800 text-ink-100 text-xs font-bold uppercase tracking-wider transition-colors pressable-accent"
          >
            [ + Text ]
          </button>
          <button
            onClick={handleAddShape}
            className="px-3 py-1.5 border border-stark-line bg-ink-800 text-accent text-xs font-bold uppercase tracking-wider transition-colors pressable-accent"
          >
            [ + Shape ]
          </button>
        </div>

        <iframe
          ref={iframeRef}
          className="w-full h-full block border-0"
          title="Live preview"
          loading="eager"
          sandbox="allow-scripts allow-same-origin"
        />
      </div>
    );
  },
);

PreviewPane.displayName = "PreviewPane";

export default PreviewPane;
