import { useEffect, useRef } from "react";
import type { InboundOrder, Ticket } from "../api";
import { formatAge, formatDue, formatPrice } from "../lib/format";
import { ageTone, sourceLabel } from "../lib/source";
import { lineNextLabel } from "../lib/status";
import { Swatch } from "./Swatch";

type LineStripProps = {
  tickets: Ticket[];
  activeId: string | null;
  now: number;
  orders: InboundOrder[];
  busy: boolean;
  commerce: boolean;
  trayOpen: boolean;
  onToggleTray: () => void;
  onOpen: (ticket: Ticket) => void;
  onRailOrder: (id: string) => void;
  onPullAll: () => void;
};

export function LineStrip({
  tickets,
  activeId,
  now,
  orders,
  busy,
  commerce,
  trayOpen,
  onToggleTray,
  onOpen,
  onRailOrder,
  onPullAll,
}: LineStripProps) {
  const selectedRef = useRef<HTMLButtonElement | null>(null);
  const waiting = orders.length;

  useEffect(() => {
    selectedRef.current?.scrollIntoView({ inline: "center", block: "nearest" });
  }, [activeId, tickets.length]);

  return (
    <section className="line" aria-label="Cans in line">
      <header className="line-head">
        <h2>Line</h2>
        <div className="line-tools">
          {waiting > 0 ? (
            <button
              type="button"
              className={`everyday-btn compact-line${trayOpen ? " on" : ""}`}
              disabled={busy}
              onClick={onToggleTray}
            >
              {trayOpen ? "Hide online" : `Online (${waiting})`}
            </button>
          ) : null}
          <span className="dim">{tickets.length === 0 ? "Nothing waiting" : `${tickets.length} waiting`}</span>
        </div>
      </header>
      {trayOpen && waiting > 0 ? (
        <div className="inbound-tray" aria-label="Online inbound tray">
          {orders.map((order) => (
            <button
              key={order.id}
              type="button"
              className="tray-card"
              disabled={busy}
              onClick={() => onRailOrder(order.id)}
            >
              <Swatch hex={order.swatch} />
              <strong>{order.orderNo}</strong>
              <span>
                {order.colorName} · {order.size}
                {order.qty > 1 ? ` × ${order.qty}` : ""}
              </span>
              <span className="dim">{formatDue(order.dueAt, now)}</span>
              <span className="line-next">Bring in</span>
            </button>
          ))}
          {waiting > 1 ? (
            <button type="button" className="everyday-btn compact-line" disabled={busy} onClick={onPullAll}>
              Bring all
            </button>
          ) : null}
        </div>
      ) : null}
      {tickets.length === 0 ? (
        <p className="empty tight">
          {waiting > 0 ? "Tap Online, then tap the order." : "Tap a color and Add to line."}
        </p>
      ) : (
        <div className="line-track">
          {tickets.map((ticket) => {
            const tone = ageTone(ticket.createdAt, now, ticket.origin);
            const late = tone !== "ok";
            return (
              <button
                key={ticket.id}
                ref={activeId === ticket.id ? selectedRef : undefined}
                type="button"
                className={`line-card${activeId === ticket.id ? " sel" : ""} tone-${tone}`}
                onClick={() => onOpen(ticket)}
              >
                <Swatch hex={ticket.formula?.swatch} />
                <div className="line-meta">
                  <strong>{ticket.colorName}</strong>
                  <span className="dim">
                    {ticket.size}
                    {ticket.qty > 1 ? ` × ${ticket.qty}` : ""}
                    {late ? ` · ${formatAge(ticket.createdAt, now)}` : ""}
                    {commerce ? ` · ${formatPrice(ticket.priceCents) ?? ""}` : ""}
                  </span>
                </div>
                <span className={`source-chip ${ticket.origin}`}>{sourceLabel(ticket.origin)}</span>
                <span className="line-next">{lineNextLabel(ticket)}</span>
              </button>
            );
          })}
        </div>
      )}
    </section>
  );
}
