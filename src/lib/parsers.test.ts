import { describe, expect, it } from "vitest";

import { getFiltersStateParser, getSortingStateParser } from "@/lib/parsers";

describe("getSortingStateParser", () => {
  it("parses valid sorting state for known columns", () => {
    const parser = getSortingStateParser<{ name: string; age: number }>([
      "name",
      "age",
    ]);

    expect(parser.parse('[{"id":"name","desc":false}]')).toEqual([
      { id: "name", desc: false },
    ]);
  });

  it("returns null for unknown sorting columns", () => {
    const parser = getSortingStateParser<{ name: string }>(["name"]);

    expect(parser.parse('[{"id":"email","desc":true}]')).toBeNull();
  });

  it("returns null for malformed sorting payloads", () => {
    const parser = getSortingStateParser<{ name: string }>(["name"]);

    expect(parser.parse("not-json")).toBeNull();
    expect(parser.parse('{"id":"name","desc":false}')).toBeNull();
  });

  it("serializes and compares sorting state", () => {
    const parser = getSortingStateParser<{ name: string }>(["name"]);
    const value = [{ id: "name" as const, desc: true }];

    expect(parser.serialize(value)).toBe('[{"id":"name","desc":true}]');
    expect(parser.eq(value, [{ id: "name" as const, desc: true }])).toBe(true);
    expect(parser.eq(value, [{ id: "name" as const, desc: false }])).toBe(
      false,
    );
  });
});

describe("getFiltersStateParser", () => {
  it("parses valid filter state for known columns", () => {
    const parser = getFiltersStateParser<{ status: string }>(
      new Set(["status"]),
    );

    expect(
      parser.parse(
        '[{"id":"status","value":"active","variant":"select","operator":"eq","filterId":"status-1"}]',
      ),
    ).toEqual([
      {
        id: "status",
        value: "active",
        variant: "select",
        operator: "eq",
        filterId: "status-1",
      },
    ]);
  });

  it("returns null for invalid filter operators or columns", () => {
    const parser = getFiltersStateParser<{ status: string }>(["status"]);

    expect(
      parser.parse(
        '[{"id":"status","value":"active","variant":"select","operator":"contains","filterId":"status-1"}]',
      ),
    ).toBeNull();

    expect(
      parser.parse(
        '[{"id":"role","value":"admin","variant":"select","operator":"eq","filterId":"role-1"}]',
      ),
    ).toBeNull();
  });

  it("serializes and compares filter state", () => {
    const parser = getFiltersStateParser<{ status: string }>(["status"]);
    const value = [
      {
        id: "status" as const,
        value: "active",
        variant: "select" as const,
        operator: "eq" as const,
        filterId: "status-1",
      },
    ];

    expect(parser.serialize(value)).toBe(
      '[{"id":"status","value":"active","variant":"select","operator":"eq","filterId":"status-1"}]',
    );
    expect(
      parser.eq(value, [
        {
          id: "status" as const,
          value: "active",
          variant: "select" as const,
          operator: "eq" as const,
          filterId: "another-filter-id",
        },
      ]),
    ).toBe(true);
    expect(
      parser.eq(value, [
        {
          id: "status" as const,
          value: "inactive",
          variant: "select" as const,
          operator: "eq" as const,
          filterId: "status-1",
        },
      ]),
    ).toBe(false);
  });
});
