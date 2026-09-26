"use client";
import { useEffect } from "react";
import { useTheme } from "next-themes";
export function ThemeChrome() {
  const { resolvedTheme } = useTheme();
  useEffect(() => {
    document.querySelectorAll<HTMLMetaElement>('meta[name="theme-color"]').forEach(meta => {
      meta.removeAttribute("media");
      meta.content = resolvedTheme === "light" ? "#FAF8F5" : "#0B0D0E";
    });
  }, [resolvedTheme]);
  return null;
}
