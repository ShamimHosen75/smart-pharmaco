import { useEffect } from "react";
import { useSettingsStore } from "@/stores/settings-store";

/**
 * Applies theme tokens from settings-store to :root CSS variables.
 * Mount once near the app root.
 */
export function useThemeSync() {
  const theme = useSettingsStore((s) => s.theme);
  const storeName = useSettingsStore((s) => s.storeInfo.name);

  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty("--primary", theme.accent); // accent drives shadcn primary
    root.style.setProperty("--accent", theme.accent);
    root.style.setProperty("--secondary", theme.secondary);
    root.style.setProperty("--background", theme.background);
    root.style.setProperty("--foreground", theme.foreground);
    root.style.setProperty("--muted-foreground", theme.muted);
    root.style.setProperty("--border", theme.border);
    root.style.setProperty("--card", theme.card);
    root.style.setProperty("--radius", `${theme.radius}rem`);
  }, [theme]);

  useEffect(() => {
    if (storeName) document.title = storeName;
  }, [storeName]);
}
