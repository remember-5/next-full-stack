import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

void test("client tRPC provider does not statically import server modules", () => {
  const filePath = resolve(import.meta.dirname, "react.tsx");
  const source = readFileSync(filePath, "utf8");

  assert.equal(
    source.includes('from "~/server/api/root"'),
    false,
    "Client provider should avoid static imports from ~/server to prevent bundling server modules into the client",
  );
});
