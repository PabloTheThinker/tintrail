import type { Ticket } from "../api";

export function plainStatus(state: Ticket["state"]): string {
  switch (state) {
    case "on_rail":
    case "validating":
      return "Waiting";
    case "dispensing":
      return "Mixing";
    case "labeled":
    case "shaken":
      return "Ready";
    case "done":
    case "binned":
      return "Done";
    case "dumped":
      return "Thrown out";
    case "remake":
      return "Remake";
    default:
      return "Draft";
  }
}

export function nextMixLabel(
  state: Ticket["state"],
  hasAck: boolean,
  qty = 1,
  scannedQty = 0,
): string {
  if (state === "on_rail") {
    if (qty > 1 && scannedQty < qty) {
      return `Scan can ${scannedQty + 1} of ${qty}`;
    }
    return "Scan";
  }
  if (state === "validating" || (state === "dispensing" && !hasAck)) {
    return "Mix";
  }
  if (hasAck && state !== "labeled" && state !== "shaken" && state !== "done") {
    return "Print";
  }
  if (state === "labeled" || state === "shaken") {
    return "Done";
  }
  return "Done";
}

export function lineNextLabel(ticket: Ticket): string {
  if (ticket.origin === "online" && (ticket.state === "labeled" || ticket.state === "shaken")) {
    return "Stage it";
  }
  return nextMixLabel(ticket.state, Boolean(ticket.ackHash), ticket.qty, ticket.scannedQty ?? 0);
}

export type MixPathId = "scan" | "mix" | "print" | "done";

export type MixPathStep = {
  id: MixPathId;
  label: string;
  phase: "done" | "now" | "next";
};

const MIX_PATH: ReadonlyArray<{ id: MixPathId; label: string }> = [
  { id: "scan", label: "Scan" },
  { id: "mix", label: "Mix" },
  { id: "print", label: "Print" },
  { id: "done", label: "Done" },
];

export function mixPathCurrent(state: Ticket["state"], hasAck: boolean): MixPathId {
  if (state === "on_rail") {
    return "scan";
  }
  if (state === "validating" || (state === "dispensing" && !hasAck)) {
    return "mix";
  }
  if (hasAck && state !== "labeled" && state !== "shaken" && state !== "done" && state !== "dumped") {
    return "print";
  }
  return "done";
}

export function mixPath(state: Ticket["state"] | null, hasAck: boolean): MixPathStep[] {
  if (!state) {
    return MIX_PATH.map((step) => ({ ...step, phase: "next" }));
  }
  if (state === "done" || state === "dumped") {
    return MIX_PATH.map((step) => ({ ...step, phase: "done" }));
  }
  const current = mixPathCurrent(state, hasAck);
  const here = MIX_PATH.findIndex((step) => step.id === current);
  return MIX_PATH.map((step, index) => ({
    ...step,
    phase: index < here ? "done" : index === here ? "now" : "next",
  }));
}
