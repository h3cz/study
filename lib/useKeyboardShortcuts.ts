"use client";

import { useEffect, useRef } from "react";

export type ShortcutHandlers = Record<string, (e: KeyboardEvent) => void>;

/**
 * Attaches a global keydown listener and calls the matching handler.
 * Keys ignored when focus is on <input>, <textarea>, or [contenteditable].
 * Modifier keys (Meta/Ctrl/Alt) suppress all shortcuts so browser bindings
 * are unaffected.
 */
export function useKeyboardShortcuts(handlers: ShortcutHandlers): void {
  // Keep a ref so the listener always sees the latest handlers without
  // needing to re-attach on every render.
  const handlersRef = useRef<ShortcutHandlers>(handlers);

  useEffect(() => {
    handlersRef.current = handlers;
  }, [handlers]);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      // Ignore when typing in a form field
      const target = e.target as HTMLElement | null;
      if (
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        target?.isContentEditable
      ) {
        return;
      }

      // Ignore if modifier keys are held (cmd/ctrl/alt suppress shortcuts)
      if (e.metaKey || e.ctrlKey || e.altKey) return;

      // Normalize the key string
      const key = e.key;

      const handler = handlersRef.current[key];
      if (handler) {
        handler(e);
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []); // attach once; handlers updated via ref
}
