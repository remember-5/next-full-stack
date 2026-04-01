import { describe, expect, it } from "vitest";

import { formatDate } from "@/lib/format";

describe("formatDate", () => {
  it("returns an empty string for missing input", () => {
    expect(formatDate(undefined)).toBe("");
  });

  it("returns an empty string for invalid dates", () => {
    expect(formatDate("not-a-date")).toBe("");
  });

  it("formats a date with the default month day year pattern", () => {
    expect(
      formatDate("2024-01-02T12:00:00.000Z", {
        timeZone: "UTC",
      }),
    ).toBe("January 2, 2024");
  });

  it("allows caller options to override the default date format", () => {
    expect(
      formatDate("2024-01-02T12:00:00.000Z", {
        month: "short",
        day: "2-digit",
        year: "2-digit",
        timeZone: "UTC",
      }),
    ).toBe("Jan 02, 24");
  });
});
