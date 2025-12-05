import Handlebars from "handlebars";
import { safeDate } from "../utils/error-handling.js";

/**
 * Month names (full and abbreviated)
 */
const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const MONTH_NAMES_SHORT = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

/**
 * Day names (full and abbreviated)
 */
const DAY_NAMES = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

const DAY_NAMES_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

/**
 * Format a date according to the provided format string
 * Supports patterns: YYYY, YY, MMMM, MMM, MM, M, DDDD, DDD, DD, D, HH, mm, ss
 */
function formatDateString(date: Date, formatStr: string): string {
  const year = date.getFullYear();
  const month = date.getMonth();
  const day = date.getDate();
  const dayOfWeek = date.getDay();
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const seconds = date.getSeconds();

  let result = formatStr;

  // Year patterns (must come before month to avoid conflicts)
  result = result.replace(/YYYY/g, String(year));
  result = result.replace(/YY/g, String(year).slice(-2));

  // Month patterns
  result = result.replace(/MMMM/g, MONTH_NAMES[month]);
  result = result.replace(/MMM/g, MONTH_NAMES_SHORT[month]);
  result = result.replace(/MM/g, String(month + 1).padStart(2, "0"));
  result = result.replace(/\bM\b/g, String(month + 1)); // Word boundary to avoid matching MM

  // Day of week patterns
  result = result.replace(/DDDD/g, DAY_NAMES[dayOfWeek]);
  result = result.replace(/DDD/g, DAY_NAMES_SHORT[dayOfWeek]);
  result = result.replace(/DD/g, String(day).padStart(2, "0"));
  result = result.replace(/\bD\b/g, String(day)); // Word boundary to avoid matching DD/DDD/DDDD

  // Time patterns
  result = result.replace(/HH/g, String(hours).padStart(2, "0"));
  result = result.replace(/mm/g, String(minutes).padStart(2, "0"));
  result = result.replace(/ss/g, String(seconds).padStart(2, "0"));

  return result;
}

/**
 * Register date/time Handlebars helpers.
 */
export function registerDateHelpers(): void {
  // Date formatting
  Handlebars.registerHelper("formatDate", (date: Date | string | number, format?: unknown) => {
    const d = safeDate(date);
    if (!d) return "";

    // Handle case where format is the options object (when no format provided)
    const formatStr = typeof format === "string" ? format : "YYYY-MM-DD";

    return formatDateString(d, formatStr);
  });

  Handlebars.registerHelper("formatTime", (date: Date | string | number) => {
    const d = safeDate(date);
    if (!d) return "";
    return d.toLocaleTimeString();
  });

  Handlebars.registerHelper("formatDateTime", (date: Date | string | number) => {
    const d = safeDate(date);
    if (!d) return "";
    return d.toLocaleString();
  });

  // Relative time
  Handlebars.registerHelper("relativeTime", (date: Date | string | number) => {
    const d = safeDate(date);
    if (!d) return "";

    const now = new Date();
    const diffMs = d.getTime() - now.getTime();
    const diffSecs = Math.floor(Math.abs(diffMs) / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    const isPast = diffMs < 0;
    const prefix = isPast ? "" : "in ";

    if (diffDays > 0) {
      return `${prefix}${diffDays} day${diffDays !== 1 ? "s" : ""}${isPast ? " ago" : ""}`;
    }
    if (diffHours > 0) {
      return `${prefix}${diffHours} hour${diffHours !== 1 ? "s" : ""}${isPast ? " ago" : ""}`;
    }
    if (diffMins > 0) {
      return `${prefix}${diffMins} minute${diffMins !== 1 ? "s" : ""}${isPast ? " ago" : ""}`;
    }
    return isPast ? "just now" : "in a moment";
  });

  // Date comparisons
  Handlebars.registerHelper("isToday", (date: Date | string | number) => {
    const d = safeDate(date);
    if (!d) return false;
    const today = new Date();
    return (
      d.getDate() === today.getDate() &&
      d.getMonth() === today.getMonth() &&
      d.getFullYear() === today.getFullYear()
    );
  });

  Handlebars.registerHelper("isPast", (date: Date | string | number) => {
    const d = safeDate(date);
    if (!d) return false;
    return d.getTime() < Date.now();
  });

  Handlebars.registerHelper("isFuture", (date: Date | string | number) => {
    const d = safeDate(date);
    if (!d) return false;
    return d.getTime() > Date.now();
  });

  // Date arithmetic
  Handlebars.registerHelper("addDays", (date: Date | string | number, days: number) => {
    const d = safeDate(date);
    if (!d) return null;
    d.setDate(d.getDate() + Number(days));
    return d;
  });

  Handlebars.registerHelper("subtractDays", (date: Date | string | number, days: number) => {
    const d = safeDate(date);
    if (!d) return null;
    d.setDate(d.getDate() - Number(days));
    return d;
  });

  Handlebars.registerHelper("addHours", (date: Date | string | number, hours: number) => {
    const d = safeDate(date);
    if (!d) return null;
    d.setHours(d.getHours() + Number(hours));
    return d;
  });

  Handlebars.registerHelper("subtractHours", (date: Date | string | number, hours: number) => {
    const d = safeDate(date);
    if (!d) return null;
    d.setHours(d.getHours() - Number(hours));
    return d;
  });

  Handlebars.registerHelper("addMinutes", (date: Date | string | number, minutes: number) => {
    const d = safeDate(date);
    if (!d) return null;
    d.setMinutes(d.getMinutes() + Number(minutes));
    return d;
  });

  Handlebars.registerHelper("subtractMinutes", (date: Date | string | number, minutes: number) => {
    const d = safeDate(date);
    if (!d) return null;
    d.setMinutes(d.getMinutes() - Number(minutes));
    return d;
  });

  // Timestamp conversion
  Handlebars.registerHelper("timestamp", (date: Date | string | number) => {
    const d = safeDate(date);
    if (!d) return 0;
    return d.getTime();
  });

  Handlebars.registerHelper("unixTimestamp", (date: Date | string | number) => {
    const d = safeDate(date);
    if (!d) return 0;
    return Math.floor(d.getTime() / 1000);
  });
}
