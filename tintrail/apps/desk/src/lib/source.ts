import type { Ticket } from "../api";

export type LineFilter = "all" | "walk-in" | "online";

export const STALE_READY_MS = 4 * 60 * 60 * 1000;

export function isLeftover(ticket: Ticket, now: number): boolean {
  const open =
    ticket.state === "on_rail" ||
    ticket.state === "validating" ||
    ticket.state === "dispensing" ||
    ticket.state === "labeled" ||
    ticket.state === "shaken";
  return open && now - ticket.createdAt >= STALE_READY_MS;
}

export function isStaleReady(ticket: Ticket, now: number): boolean {
  return isLeftover(ticket, now);
}

export function isOpenLineTicket(ticket: Ticket, now: number): boolean {
  const open =
    ticket.state === "on_rail" ||
    ticket.state === "validating" ||
    ticket.state === "dispensing" ||
    ticket.state === "labeled" ||
    ticket.state === "shaken";
  return open && !isLeftover(ticket, now);
}

export function sourceLabel(origin: Ticket["origin"]): string {
  switch (origin) {
    case "walk-up":
      return "Walk-in";
    case "online":
      return "Online";
    case "kiosk":
      return "Kiosk";
    case "pro-job":
      return "Pro";
    default:
      return "Desk";
  }
}

export function ageTone(createdAt: number, now: number, origin: Ticket["origin"]): "ok" | "warn" | "late" {
  const minutes = Math.max(0, Math.floor((now - createdAt) / 60000));
  if (origin === "online") {
    if (minutes >= 90) {
      return "late";
    }
    if (minutes >= 20) {
      return "warn";
    }
    return "ok";
  }
  if (minutes >= 30) {
    return "late";
  }
  if (minutes >= 10) {
    return "warn";
  }
  return "ok";
}

export function matchesLineFilter(ticket: Ticket, filter: LineFilter): boolean {
  if (filter === "all") {
    return true;
  }
  if (filter === "online") {
    return ticket.origin === "online";
  }
  return ticket.origin !== "online";
}

export function sortLineTickets(tickets: Ticket[], now: number): Ticket[] {
  return tickets.slice().sort((a, b) => {
    const aLateOnline = a.origin === "online" && ageTone(a.createdAt, now, a.origin) === "late";
    const bLateOnline = b.origin === "online" && ageTone(b.createdAt, now, b.origin) === "late";
    if (aLateOnline !== bLateOnline) {
      return aLateOnline ? -1 : 1;
    }
    return a.createdAt - b.createdAt;
  });
}
