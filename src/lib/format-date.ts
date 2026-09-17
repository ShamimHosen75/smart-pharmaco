import { useSettingsStore } from "@/stores/settings-store";

/** Maps the configured date format to a locale that renders it. */
const localeFor = (fmt: string) => {
  switch (fmt) {
    case "MM/DD/YYYY":
      return "en-US";
    case "YYYY-MM-DD":
      return "en-CA";
    default:
      return "en-GB"; // DD/MM/YYYY — Bangladesh default
  }
};

/** Formats a date using the pharmacy's configured date format. */
export const fmtDate = (d: Date | string | number) => {
  const date = d instanceof Date ? d : new Date(d);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString(localeFor(useSettingsStore.getState().global.dateFormat));
};

/** Formats a date with a readable month, e.g. 05 Mar 2026. */
export const fmtDateLong = (d: Date | string | number) => {
  const date = d instanceof Date ? d : new Date(d);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString(localeFor(useSettingsStore.getState().global.dateFormat), {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

/** 24-hour time, common in Bangladesh receipts. */
export const fmtTime = (d: Date | string | number) => {
  const date = d instanceof Date ? d : new Date(d);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
};
