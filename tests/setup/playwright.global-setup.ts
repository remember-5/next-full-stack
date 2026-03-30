import { execFileSync } from "node:child_process";
import { existsSync } from "node:fs";
import { resolve } from "node:path";

function getPnpmCommand() {
  return process.platform === "win32" ? "pnpm.cmd" : "pnpm";
}

export default function globalSetup() {
  const root = process.cwd();
  const envPath = resolve(root, ".env.test");

  if (!existsSync(envPath)) {
    throw new Error(
      "Missing .env.test. Copy .env.test.example to .env.test before running Playwright.",
    );
  }

  const pnpmCommand = getPnpmCommand();

  execFileSync(pnpmCommand, ["db:push:test"], {
    cwd: root,
    stdio: "inherit",
  });
  execFileSync(pnpmCommand, ["auth:init-admin:test"], {
    cwd: root,
    stdio: "inherit",
  });
}
