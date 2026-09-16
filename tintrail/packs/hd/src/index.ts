import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import type { PackCatalog, PackPolicy } from "@tintrail/shared";

const root = dirname(fileURLToPath(new URL("../catalog.json", import.meta.url)));

export function loadHdCatalog(): PackCatalog {
  return JSON.parse(readFileSync(join(root, "catalog.json"), "utf8")) as PackCatalog;
}

export function loadHdPolicy(): PackPolicy {
  return JSON.parse(readFileSync(join(root, "policy.json"), "utf8")) as PackPolicy;
}
