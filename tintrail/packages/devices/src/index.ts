import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import type { DeviceDrivers, MixVector } from "@tintrail/shared";

export function createMockDrivers(labelDir: string): DeviceDrivers {
  return {
    async validateCan(sku, barcode) {
      if (barcode.trim() === "") {
        return { ok: false, reason: "Scan the can barcode" };
      }
      if (barcode !== sku) {
        return { ok: false, reason: "Barcode does not match SKU" };
      }
      return { ok: true };
    },

    async dispense(vector) {
      const ack: MixVector = { ...vector };
      return { ack };
    },

    async print(input) {
      await mkdir(labelDir, { recursive: true });
      const path = join(labelDir, `${input.hash}.txt`);
      const body = [
        "TINTRAIL LABEL",
        `hash=${input.hash}`,
        `sku=${input.sku}`,
        ...input.recipe,
        "",
      ].join("\n");
      await writeFile(path, body, "utf8");
      return { printed: true, path };
    },
  };
}
