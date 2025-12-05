import Handlebars from "handlebars";

/**
 * Register date/time Handlebars helpers.
 */
export function registerDateHelpers(): void {
  // Date formatting
  Handlebars.registerHelper("formatDate", (date: Date | string | number, format?: string) => {
    const d = new Date(date);
    if (Number.isNaN(d.getTime())) return "";

    const formatStr = format || "YYYY-MM-DD";
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    const hours = String(d.getHours()).padStart(2, "0");
    const minutes = String(d.getMinutes()).padStart(2, "0");
    const seconds = String(d.getSeconds()).padStart(2, "0");

    return formatStr
      .replace("YYYY", String(year))
      .replace("MM", month)
      .replace("DD", day)
      .replace("HH", hours)
      .replace("mm", minutes)
      .replace("ss", seconds);
  });

  Handlebars.registerHelper("formatTime", (date: Date | string | number) => {
    const d = new Date(date);
    if (Number.isNaN(d.getTime())) return "";
    return d.toLocaleTimeString();
  });

  Handlebars.registerHelper("formatDateTime", (date: Date | string | number) => {
    const d = new Date(date);
    if (Number.isNaN(d.getTime())) return "";
    return d.toLocaleString();
  });

  // Relative time
  Handlebars.registerHelper("relativeTime", (date: Date | string | number) => {
    const d = new Date(date);
    if (Number.isNaN(d.getTime())) return "";

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
    const d = new Date(date);
    if (Number.isNaN(d.getTime())) return false;
    const today = new Date();
    return (
      d.getDate() === today.getDate() &&
      d.getMonth() === today.getMonth() &&
      d.getFullYear() === today.getFullYear()
    );
  });

  Handlebars.registerHelper("isPast", (date: Date | string | number) => {
    const d = new Date(date);
    if (Number.isNaN(d.getTime())) return false;
    return d.getTime() < Date.now();
  });

  Handlebars.registerHelper("isFuture", (date: Date | string | number) => {
    const d = new Date(date);
    if (Number.isNaN(d.getTime())) return false;
    return d.getTime() > Date.now();
  });

  // Date arithmetic
  Handlebars.registerHelper("addDays", (date: Date | string | number, days: number) => {
    const d = new Date(date);
    if (Number.isNaN(d.getTime())) return null;
    d.setDate(d.getDate() + Number(days));
    return d;
  });

  Handlebars.registerHelper("subtractDays", (date: Date | string | number, days: number) => {
    const d = new Date(date);
    if (Number.isNaN(d.getTime())) return null;
    d.setDate(d.getDate() - Number(days));
    return d;
  });

  Handlebars.registerHelper("addHours", (date: Date | string | number, hours: number) => {
    const d = new Date(date);
    if (Number.isNaN(d.getTime())) return null;
    d.setHours(d.getHours() + Number(hours));
    return d;
  });

  Handlebars.registerHelper("subtractHours", (date: Date | string | number, hours: number) => {
    const d = new Date(date);
    if (Number.isNaN(d.getTime())) return null;
    d.setHours(d.getHours() - Number(hours));
    return d;
  });

  Handlebars.registerHelper("addMinutes", (date: Date | string | number, minutes: number) => {
    const d = new Date(date);
    if (Number.isNaN(d.getTime())) return null;
    d.setMinutes(d.getMinutes() + Number(minutes));
    return d;
  });

  Handlebars.registerHelper("subtractMinutes", (date: Date | string | number, minutes: number) => {
    const d = new Date(date);
    if (Number.isNaN(d.getTime())) return null;
    d.setMinutes(d.getMinutes() - Number(minutes));
    return d;
  });

  // Timestamp conversion
  Handlebars.registerHelper("timestamp", (date: Date | string | number) => {
    const d = new Date(date);
    if (Number.isNaN(d.getTime())) return 0;
    return d.getTime();
  });

  Handlebars.registerHelper("unixTimestamp", (date: Date | string | number) => {
    const d = new Date(date);
    if (Number.isNaN(d.getTime())) return 0;
    return Math.floor(d.getTime() / 1000);
  });
}
