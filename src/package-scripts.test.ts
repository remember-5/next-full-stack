import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

type PackageJson = {
  scripts?: Record<string, string>;
};

void test("test scripts use double-quoted globs for cross-platform tsx execution", () => {
  const packageJson = JSON.parse(
    readFileSync(new URL("../package.json", import.meta.url), "utf8"),
  ) as PackageJson;

  assert.equal(
    packageJson.scripts?.test,
    'tsx --test "src/**/*.test.ts" "src/**/*.test.tsx"',
  );
  assert.equal(
    packageJson.scripts?.["test:watch"],
    'tsx --test --watch "src/**/*.test.ts" "src/**/*.test.tsx"',
  );
});
