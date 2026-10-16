"use client";

import React, { useEffect, useRef, useCallback } from "react";
import { useEditorStore } from "@/stores/editorStore";

/**
 * PreviewPane — renders the user's HTML/CSS/JS into a same-origin iframe.
 *
 * Uses srcdoc so canvas drawImage can read the rendered DOM (same-origin),
 * which is required by recorder.ts CanvasCapture.
 */
export function PreviewPane({ className = "" }: { className?: string }) {
  const { html, css, js } = useEditorStore((s) => ({
    html: s.html,
    css: s.css,
    js: s.js,
  }));
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const buildDoc = useCallback(() => {
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
</style>
</head>
<body>
${html}
<script>
${escapedJs}
</script>
</body>
</html>`;
  }, [html, css, js]);

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe || !iframe.contentDocument) return;
    iframe.srcdoc = buildDoc();
  }, [buildDoc]);

  return (
    <div className={`w-full h-full overflow-hidden bg-ink-900 ${className}`}>
      <iframe
        ref={iframeRef}
        className="w-full h-full block border-0"
        title="Live preview"
        loading="eager"
        sandbox="allow-scripts allow-same-origin"
      />
    </div>
  );
}
