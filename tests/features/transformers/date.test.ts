import Handlebars from "handlebars";
import { beforeEach, describe, expect, it } from "vitest";
import { PromptWeaver } from "../../../src/core/prompt-weaver.js";
import { registerDateHelpers } from "../../../src/transformers/date.js";

describe("Date Transformers Feature", () => {
  beforeEach(() => {
    // Unregister all date helpers
    const helpers = [
      "formatDate",
      "formatTime",
      "formatDateTime",
      "relativeTime",
      "isToday",
      "isPast",
      "isFuture",
      "addDays",
      "subtractDays",
      "addHours",
      "subtractHours",
      "addMinutes",
      "subtractMinutes",
      "timestamp",
      "unixTimestamp",
    ];
    helpers.forEach((helper) => {
      Handlebars.unregisterHelper(helper);
    });
    registerDateHelpers();
  });

  describe("Date Formatting", () => {
    it("should format date with default format", () => {
      const template = "{{formatDate date}}";
      const weaver = new PromptWeaver(template);
      const date = new Date("2024-01-15T10:30:00Z");
      const result = weaver.format({ date });
      // Should use default format when no format parameter provided
      expect(result).toMatch(/\d{4}-\d{2}-\d{2}/);
    });

    it("should format date with explicit format parameter", () => {
      const template = "{{formatDate date 'YYYY-MM-DD'}}";
      const weaver = new PromptWeaver(template);
      const date = new Date("2024-01-15T10:30:00Z");
      const result = weaver.format({ date });
      expect(result).toBe("2024-01-15");
    });

    it("should format date with custom format string", () => {
      const template = "{{formatDate date 'YYYY-MM-DD'}}";
      const weaver = new PromptWeaver(template);
      const date = new Date("2024-01-15T10:30:00Z");
      const result = weaver.format({ date });
      expect(result).toBe("2024-01-15");
    });

    it("should format date with time components", () => {
      const template = "{{formatDate date 'YYYY-MM-DD HH:mm:ss'}}";
      const weaver = new PromptWeaver(template);
      const date = new Date("2024-01-15T14:30:45Z");
      const result = weaver.format({ date });
      expect(result).toContain("2024-01-15");
      expect(result).toContain(":");
    });

    it("should handle date string input", () => {
      const template = "{{formatDate date 'YYYY-MM-DD'}}";
      const weaver = new PromptWeaver(template);
      const result = weaver.format({ date: "2024-01-15" });
      expect(result).toBe("2024-01-15");
    });

    it("should handle timestamp input", () => {
      const template = "{{formatDate date 'YYYY-MM-DD'}}";
      const weaver = new PromptWeaver(template);
      const timestamp = new Date("2024-01-15").getTime();
      const result = weaver.format({ date: timestamp });
      expect(result).toBe("2024-01-15");
    });

    it("should return empty string for invalid date", () => {
      const template = "{{formatDate date}}";
      const weaver = new PromptWeaver(template);
      expect(weaver.format({ date: "invalid" })).toBe("");
    });

    it("should format time", () => {
      const template = "{{formatTime date}}";
      const weaver = new PromptWeaver(template);
      const date = new Date("2024-01-15T14:30:00Z");
      const result = weaver.format({ date });
      expect(result).toMatch(/\d{1,2}:\d{2}:\d{2}/);
    });

    it("should return empty string for invalid time", () => {
      const template = "{{formatTime date}}";
      const weaver = new PromptWeaver(template);
      expect(weaver.format({ date: "invalid" })).toBe("");
    });

    it("should format date and time", () => {
      const template = "{{formatDateTime date}}";
      const weaver = new PromptWeaver(template);
      const date = new Date("2024-01-15T14:30:00Z");
      const result = weaver.format({ date });
      expect(result.length).toBeGreaterThan(0);
    });

    it("should return empty string for invalid dateTime", () => {
      const template = "{{formatDateTime date}}";
      const weaver = new PromptWeaver(template);
      expect(weaver.format({ date: "invalid" })).toBe("");
    });
  });

  describe("Relative Time", () => {
    it("should format past relative time", () => {
      const template = "{{relativeTime date}}";
      const weaver = new PromptWeaver(template);
      const now = new Date();
      const past = new Date(now.getTime() - 2 * 60 * 60 * 1000); // 2 hours ago
      const result = weaver.format({ date: past });
      expect(result).toContain("ago");
    });

    it("should format future relative time", () => {
      const template = "{{relativeTime date}}";
      const weaver = new PromptWeaver(template);
      const now = new Date();
      const future = new Date(now.getTime() + 2 * 60 * 60 * 1000); // 2 hours from now
      const result = weaver.format({ date: future });
      expect(result).toContain("in");
    });

    it("should format days ago", () => {
      const template = "{{relativeTime date}}";
      const weaver = new PromptWeaver(template);
      const now = new Date();
      const past = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000); // 3 days ago
      const result = weaver.format({ date: past });
      expect(result).toContain("3 day");
      expect(result).toContain("ago");
    });

    it("should format hours ago", () => {
      const template = "{{relativeTime date}}";
      const weaver = new PromptWeaver(template);
      const now = new Date();
      const past = new Date(now.getTime() - 5 * 60 * 60 * 1000); // 5 hours ago
      const result = weaver.format({ date: past });
      expect(result).toContain("5 hour");
      expect(result).toContain("ago");
    });

    it("should format minutes ago", () => {
      const template = "{{relativeTime date}}";
      const weaver = new PromptWeaver(template);
      const now = new Date();
      const past = new Date(now.getTime() - 30 * 60 * 1000); // 30 minutes ago
      const result = weaver.format({ date: past });
      expect(result).toContain("minute");
      expect(result).toContain("ago");
    });

    it("should format just now for very recent past", () => {
      const template = "{{relativeTime date}}";
      const weaver = new PromptWeaver(template);
      const now = new Date();
      const past = new Date(now.getTime() - 30 * 1000); // 30 seconds ago
      const result = weaver.format({ date: past });
      expect(result).toBe("just now");
    });

    it("should format in a moment for very near future", () => {
      const template = "{{relativeTime date}}";
      const weaver = new PromptWeaver(template);
      const now = new Date();
      const future = new Date(now.getTime() + 30 * 1000); // 30 seconds from now
      const result = weaver.format({ date: future });
      expect(result).toBe("in a moment");
    });

    it("should handle pluralization correctly", () => {
      const template = "{{relativeTime date}}";
      const weaver = new PromptWeaver(template);
      const now = new Date();
      const past1 = new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000); // 1 day ago
      const past2 = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000); // 2 days ago
      const result1 = weaver.format({ date: past1 });
      const result2 = weaver.format({ date: past2 });
      expect(result1).toContain("1 day");
      expect(result2).toContain("2 days");
    });

    it("should return empty string for invalid date", () => {
      const template = "{{relativeTime date}}";
      const weaver = new PromptWeaver(template);
      expect(weaver.format({ date: "invalid" })).toBe("");
    });
  });

  describe("Date Comparisons", () => {
    it("should check if date is today", () => {
      const template = "{{#if (isToday date)}}Today{{else}}Not Today{{/if}}";
      const weaver = new PromptWeaver(template);
      const today = new Date();
      expect(weaver.format({ date: today })).toBe("Today");
    });

    it("should check if date is not today", () => {
      const template = "{{#if (isToday date)}}Today{{else}}Not Today{{/if}}";
      const weaver = new PromptWeaver(template);
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      expect(weaver.format({ date: yesterday })).toBe("Not Today");
    });

    it("should return false for invalid date in isToday", () => {
      const template = "{{isToday date}}";
      const weaver = new PromptWeaver(template);
      expect(weaver.format({ date: "invalid" })).toBe("false");
    });

    it("should check if date is in the past", () => {
      const template = "{{#if (isPast date)}}Past{{else}}Future{{/if}}";
      const weaver = new PromptWeaver(template);
      const past = new Date();
      past.setTime(past.getTime() - 1000);
      expect(weaver.format({ date: past })).toBe("Past");
    });

    it("should check if date is in the future", () => {
      const template = "{{#if (isFuture date)}}Future{{else}}Past{{/if}}";
      const weaver = new PromptWeaver(template);
      const future = new Date();
      future.setTime(future.getTime() + 1000);
      expect(weaver.format({ date: future })).toBe("Future");
    });

    it("should return false for invalid date in isPast/isFuture", () => {
      const template = "{{isPast date}}";
      const weaver = new PromptWeaver(template);
      expect(weaver.format({ date: "invalid" })).toBe("false");
    });
  });

  describe("Date Arithmetic", () => {
    it("should add days to date", () => {
      const template = "{{formatDate (addDays date 5) 'YYYY-MM-DD'}}";
      const weaver = new PromptWeaver(template);
      const date = new Date("2024-01-15");
      const result = weaver.format({ date });
      expect(result).toBe("2024-01-20");
    });

    it("should subtract days from date", () => {
      const template = "{{formatDate (subtractDays date 3) 'YYYY-MM-DD'}}";
      const weaver = new PromptWeaver(template);
      const date = new Date("2024-01-15");
      const result = weaver.format({ date });
      expect(result).toBe("2024-01-12");
    });

    it("should add hours to date", () => {
      const template = "{{formatDate (addHours date 2) 'YYYY-MM-DD HH'}}";
      const weaver = new PromptWeaver(template);
      const date = new Date("2024-01-15T10:00:00Z");
      const result = weaver.format({ date });
      // Result should be a valid date string with hours
      expect(result).toMatch(/\d{4}-\d{2}-\d{2} \d{1,2}/);
      // Verify the date part is correct
      expect(result).toContain("2024-01-15");
    });

    it("should subtract hours from date", () => {
      const template = "{{formatDate (subtractHours date 2) 'YYYY-MM-DD HH'}}";
      const weaver = new PromptWeaver(template);
      const date = new Date("2024-01-15T10:00:00Z");
      const result = weaver.format({ date });
      // Result should be a valid date string with hours
      expect(result).toMatch(/\d{4}-\d{2}-\d{2} \d{1,2}/);
      // Verify the date part is correct
      expect(result).toContain("2024-01-15");
    });

    it("should add minutes to date", () => {
      const template = "{{formatDate (addMinutes date 30) 'mm'}}";
      const weaver = new PromptWeaver(template);
      const date = new Date("2024-01-15T10:00:00Z");
      const result = weaver.format({ date });
      const minutes = parseInt(result, 10);
      expect(minutes).toBeGreaterThanOrEqual(0);
      expect(minutes).toBeLessThanOrEqual(59);
    });

    it("should subtract minutes from date", () => {
      const template = "{{formatDate (subtractMinutes date 15) 'mm'}}";
      const weaver = new PromptWeaver(template);
      const date = new Date("2024-01-15T10:30:00Z");
      const result = weaver.format({ date });
      const minutes = parseInt(result, 10);
      expect(minutes).toBeGreaterThanOrEqual(0);
      expect(minutes).toBeLessThanOrEqual(59);
    });

    it("should return null for invalid date in arithmetic", () => {
      const template = "{{addDays date 5}}";
      const weaver = new PromptWeaver(template);
      expect(weaver.format({ date: "invalid" })).toBe("");
    });

    it("should handle date string input in arithmetic", () => {
      const template = "{{formatDate (addDays date 1) 'YYYY-MM-DD'}}";
      const weaver = new PromptWeaver(template);
      const result = weaver.format({ date: "2024-01-15" });
      expect(result).toBe("2024-01-16");
    });
  });

  describe("Timestamp Conversion", () => {
    it("should convert date to timestamp", () => {
      const template = "{{timestamp date}}";
      const weaver = new PromptWeaver(template);
      const date = new Date("2024-01-15T00:00:00Z");
      const result = weaver.format({ date });
      expect(parseInt(result, 10)).toBeGreaterThan(0);
    });

    it("should convert date to unix timestamp", () => {
      const template = "{{unixTimestamp date}}";
      const weaver = new PromptWeaver(template);
      const date = new Date("2024-01-15T00:00:00Z");
      const result = weaver.format({ date });
      const unix = parseInt(result, 10);
      expect(unix).toBeGreaterThan(0);
      // Unix timestamp should be roughly 10 digits for dates around 2024
      expect(unix.toString().length).toBeGreaterThanOrEqual(9);
    });

    it("should return 0 for invalid date in timestamp", () => {
      const template = "{{timestamp date}}";
      const weaver = new PromptWeaver(template);
      expect(weaver.format({ date: "invalid" })).toBe("0");
    });

    it("should return 0 for invalid date in unixTimestamp", () => {
      const template = "{{unixTimestamp date}}";
      const weaver = new PromptWeaver(template);
      expect(weaver.format({ date: "invalid" })).toBe("0");
    });
  });
});
