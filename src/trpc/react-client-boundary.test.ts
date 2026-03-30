import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { expect, test } from "vitest";

import { getDirname } from "~/lib/esm-path";

test("client tRPC provider does not statically import server modules", () => {
  const filePath = resolve(getDirname(import.meta.url), "react.tsx");
  const source = readFileSync(filePath, "utf8");

  expect(
    source.includes('from "~/server/api/root"'),
    "Client provider should avoid static imports from ~/server to prevent bundling server modules into the client",
  ).toBe(false);
});
