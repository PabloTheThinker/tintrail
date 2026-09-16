import type { PackPolicy, Ticket } from "@tintrail/shared";
import type { SyncAdapter } from "@tintrail/sync";

export function notifyReady(sync: SyncAdapter, policy: PackPolicy, ticket: Ticket): void {
  if (policy.notify === "off") {
    return;
  }
  sync.enqueue("ticket.ready", {
    id: ticket.id,
    token: ticket.token,
    stageBin: ticket.stageBin,
    origin: ticket.origin,
  });
}
