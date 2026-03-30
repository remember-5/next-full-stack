import assert from "node:assert/strict";
import test from "node:test";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

import { getDirname } from "./esm-path";

void test("getDirname resolves an ESM module directory from import.meta.url", () => {
  assert.equal(getDirname(import.meta.url), dirname(fileURLToPath(import.meta.url)));
});
