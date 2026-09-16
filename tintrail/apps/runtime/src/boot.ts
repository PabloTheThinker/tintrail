import { join } from "node:path";
import { createMockDrivers } from "@tintrail/devices";
import { loadHdCatalog } from "@tintrail/pack-hd";
import { openRailStore } from "@tintrail/rail";
import { createFileOutboxSync } from "@tintrail/sync";
import { createApp, type RuntimeDeps } from "./app.ts";

export function createRuntime(dataDir: string): {
  app: ReturnType<typeof createApp>;
  deps: RuntimeDeps;
} {
  const catalog = loadHdCatalog();
  const rail = openRailStore(join(dataDir, "rail.db"));
  rail.saveCatalogSnapshot(catalog);
  if (rail.getMeta("sync.enabled") === null) {
    rail.setMeta("sync.enabled", "1");
  }
  const sync = createFileOutboxSync(rail);
  const devices = createMockDrivers(join(dataDir, "labels"));
  const deps: RuntimeDeps = { catalog, rail, sync, devices };
  return { app: createApp(deps), deps };
}
