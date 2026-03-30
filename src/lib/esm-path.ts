import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

export function getDirname(moduleUrl: string | URL): string {
  return dirname(fileURLToPath(moduleUrl));
}
