import type { DeviceStatus } from "../api";

export function deviceStatusLabel(devices: DeviceStatus, offline: boolean): string {
  const down: string[] = [];
  if (devices.spectro === "bad") {
    down.push("Color reader down");
  }
  if (devices.dispenser === "bad") {
    down.push("Mixer down");
  }
  if (devices.printer === "bad") {
    down.push("Printer down");
  }
  if (down.length > 0) {
    return down.join(" · ");
  }
  if (offline) {
    return "Offline — still works";
  }
  const warn =
    devices.spectro === "warn" || devices.dispenser === "warn" || devices.printer === "warn";
  if (warn) {
    return "Check the mixer — still works";
  }
  return "Ready";
}

export function devicesNeedAttention(devices: DeviceStatus, offline: boolean): boolean {
  return (
    offline ||
    devices.spectro !== "ok" ||
    devices.dispenser !== "ok" ||
    devices.printer !== "ok"
  );
}
