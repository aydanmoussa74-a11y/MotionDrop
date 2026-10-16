"use client";

import React, { useRef, useEffect, useCallback } from "react";
import { useEditorStore } from "@/stores/editorStore";

type Tab = "html" | "css" | "js";

const TAB_LABELS: Record<Tab, string> = {
  html: "HTML",
  css: "CSS",
  js: "JS",
};

const TABS: Tab[] = ["html", "css", "js"];

interface CodeEditorProps {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
}

export function CodeEditor({ activeTab, onTabChange }: CodeEditorProps) {
  const codeRef = useRef<HTMLTextAreaElement>(null);
  const { html, css, js } = useEditorStore((s) => ({
    html: s.html,
    css: s.css,
    js: s.js,
  }));
  const setHtml = useEditorStore((s) => s.setHtml);
  const setCss = useEditorStore((s) => s.setCss);
  const setJs = useEditorStore((s) => s.setJs);

  const currentCode = activeTab === "html" ? html : activeTab === "css" ? css : js;

  // Sync textarea value when external state changes (e.g. tab switch / reset)
  useEffect(() => {
    if (codeRef.current && codeRef.current.value !== currentCode) {
      codeRef.current.value = currentCode;
    }
  }, [currentCode, activeTab]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    if (activeTab === "html") setHtml(val);
    else if (activeTab === "css") setCss(val);
    else setJs(val);
  };

  return (
    <div className="w-full h-full flex flex-col">
      {/* Tab bar — stark, high-contrast */}
      <div className="flex border-b border-stark-line bg-ink-800">
        {TABS.map((tab) => {
          const isActive = activeTab === tab;
          return (
            <button
              key={tab}
              role="tab"
              aria-selected={isActive}
              onClick={() => {
                onTabChange(tab);
              }}
              className={`flex-1 py-3 text-center font-display font-bold text-sm tracking-wider uppercase transition-colors ${
                isActive
                  ? "text-stark-white border-b-2 border-accent"
                  : "text-ink-300 hover:text-ink-50"
              }`}
            >
              {TAB_LABELS[tab]}
            </button>
          );
        })}
      </div>

      {/* Editor area */}
      <div className="flex-1 relative overflow-hidden bg-ink-900">
        <textarea
          ref={codeRef}
          value={currentCode}
          onChange={handleChange}
          className="w-full h-full p-5 font-mono text-xs leading-relaxed text-ink-100 bg-transparent resize-none outline-none"
          spellCheck={false}
          autoCorrect="off"
          autoCapitalize="off"
          placeholder={`Write ${TAB_LABELS[activeTab]}…`}
        />
        {/* Editor border frame */}
        <div className="absolute inset-0 border border-stark-line pointer-events-none" />
      </div>
    </div>
  );
}
