export function formatAge(createdAt: number, now: number): string {
  const seconds = Math.max(0, Math.floor((now - createdAt) / 1000));
  const minutes = Math.floor(seconds / 60);
  if (minutes >= 60) {
    const hours = Math.floor(minutes / 60);
    const rest = minutes % 60;
    return `${hours}h ${rest}m`;
  }
  const rest = seconds % 60;
  return `${minutes}:${rest.toString().padStart(2, "0")}`;
}

export function shortHash(hash: string | null | undefined): string {
  if (!hash) {
    return "—";
  }
  return hash.slice(0, 8);
}

export function formatPrice(cents: number | null | undefined): string | null {
  if (cents === null || cents === undefined) {
    return null;
  }
  return `$${(cents / 100).toFixed(2)}`;
}

export function formatDue(dueAt: number, now: number): string {
  const minutes = Math.round((dueAt - now) / 60_000);
  if (minutes < 0) {
    return "late";
  }
  if (minutes >= 60) {
    return `due ${Math.floor(minutes / 60)}h`;
  }
  return `due ${minutes}m`;
}

export function catalogClock(asOf: string): string {
  const date = new Date(asOf);
  if (Number.isNaN(date.getTime())) {
    return asOf;
  }
  return date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}
