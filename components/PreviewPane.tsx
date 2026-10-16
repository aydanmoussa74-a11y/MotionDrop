"use client";

import React, { useEffect, useRef, useCallback, useImperativeHandle } from "react";
import {
  DndContext,
  useSensor,
  PointerSensor,
} from "@dnd-kit/core";
import { useEditorStore } from "@/stores/editorStore";

type PreviewPaneProps = { className?: string; ref?: React.Ref<HTMLIFrameElement> };

/**
 * PreviewPane — renders the user's HTML/CSS/JS into a same-origin iframe.
 * Includes a floating Asset Bar for adding draggable text/shape overlays.
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
    const iframeRef = useRef<HTMLIFrameElement>(null);

    useImperativeHandle(ref, () => iframeRef.current!);

    const sensors = useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    });

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
            `<div id="motiondrop-overlay-${o.id}">${o.text}</div>`,
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
</body>
</html>`;
    }, [html, css, js, overlays]);

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

          <DndContext sensors={[sensors]}>
          <iframe
            ref={iframeRef}
            className="w-full h-full block border-0"
            title="Live preview"
            loading="eager"
            sandbox="allow-scripts allow-same-origin"
          />
        </DndContext>
      </div>
    );
  },
);

PreviewPane.displayName = "PreviewPane";

export default PreviewPane;
