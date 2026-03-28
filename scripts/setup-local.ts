import { randomBytes } from "node:crypto";
import { copyFileSync, existsSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const envExamplePath = resolve(root, ".env.example");
const envPath = resolve(root, ".env");

if (!existsSync(envPath)) {
  copyFileSync(envExamplePath, envPath);
}

const currentEnv = readFileSync(envPath, "utf8");
let nextEnv = currentEnv;

if (!/^BETTER_AUTH_URL=".+"/m.test(nextEnv)) {
  nextEnv = nextEnv.replace(
    /^BETTER_AUTH_SECRET=".*"$/m,
    ['BETTER_AUTH_URL="http://localhost:3000"', "$&"].join("\n"),
  );
}

if (!/^BETTER_AUTH_SECRET=".+"/m.test(nextEnv)) {
  nextEnv = nextEnv.replace(
    /^BETTER_AUTH_SECRET=""$/m,
    `BETTER_AUTH_SECRET="${randomBytes(32).toString("base64url")}"`
  );
}

writeFileSync(envPath, nextEnv);

console.log("Local environment ready.");
console.log("Next steps:");
console.log("1. docker compose up -d db");
console.log("2. pnpm db:push");
console.log("3. pnpm auth:init-admin");
console.log("4. pnpm dev");
