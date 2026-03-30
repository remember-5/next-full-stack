import { spawnSync } from "node:child_process";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { expect, test } from "vitest";

import { getDirname } from "~/lib/esm-path";

test("database module can be imported from a Node CLI runtime", () => {
  const currentDir = getDirname(import.meta.url);
  const moduleUrl = pathToFileURL(resolve(currentDir, "db.ts")).href;
  const result = spawnSync(
    process.execPath,
    [
      "--input-type=module",
      "--import",
      "tsx",
      "-e",
      [
        'process.env.DATABASE_URL = "postgresql://postgres:password@localhost:5432/next-full-stack";',
        'process.env.NODE_ENV = "test";',
        `const { db } = await import(${JSON.stringify(moduleUrl)});`,
        "await db.$disconnect();",
      ].join("\n"),
    ],
    {
      encoding: "utf8",
      cwd: resolve(currentDir, "../.."),
    },
  );

  if (result.status !== 0) {
    throw new Error(
      `Expected CLI import to succeed.\nstdout:\n${result.stdout}\nstderr:\n${result.stderr}`,
    );
  }

  expect(result.status).toBe(0);
});
