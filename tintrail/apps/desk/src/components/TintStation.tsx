import { useRef, useState } from "react";
import type { Ticket } from "../api";
import { sourceLabel } from "../lib/source";
import { formatPrice } from "../lib/format";
import { mixPath, nextMixLabel, plainStatus } from "../lib/status";
import { Swatch } from "./Swatch";

type TintStationProps = {
  ticket: Ticket | null;
  barcode: string;
  busy: boolean;
  commerce: boolean;
  onBarcode: (value: string) => void;
  onUseSku: () => void;
  onNext: () => void;
  onWrongCan: () => void;
};

export function TintStation({
  ticket,
  barcode,
  busy,
  commerce,
  onBarcode,
  onUseSku,
  onNext,
  onWrongCan,
}: TintStationProps) {
  const barcodeRef = useRef<HTMLInputElement>(null);
  const [more, setMore] = useState(false);

  if (!ticket) {
    return (
      <section className="panel tint" aria-label="Mix a can">
        <h2>Make</h2>
        <ol className="mix-path" aria-label="Mix steps">
          {mixPath(null, false).map((step) => (
            <li key={step.id} className={`mix-step ${step.phase}`}>
              {step.label}
            </li>
          ))}
        </ol>
        <p className="help">Add a can on the left. Then tap the yellow button here.</p>
      </section>
    );
  }

  const recipe = ticket.formula?.displayRecipe ?? [];
  const nextLabel = nextMixLabel(
    ticket.state,
    Boolean(ticket.ackHash),
    ticket.qty,
    ticket.scannedQty ?? 0,
  );
  const finished = ticket.state === "done" || ticket.state === "dumped";
  const needsScan = ticket.state === "on_rail" || ticket.state === "validating";

  return (
    <section className="panel tint" aria-label="Mix a can">
      <h2>Make</h2>
      <div className="tint-simple">
        <ol className="mix-path" aria-label="Mix steps">
          {mixPath(ticket.state, Boolean(ticket.ackHash)).map((step) => (
            <li key={step.id} className={`mix-step ${step.phase}`}>
              {step.label}
            </li>
          ))}
        </ol>
        <div className="ticket-head">
          <Swatch hex={ticket.formula?.swatch} large />
          <div>
            <div className="name">{ticket.colorName}</div>
            <div className="dim">
              {ticket.productLine} {ticket.sheen} · {ticket.size}
              {ticket.qty > 1 ? ` × ${ticket.qty}` : ""}
            </div>
            <div className="make-tags">
              <span className={`source-chip ${ticket.origin}`}>{sourceLabel(ticket.origin)}</span>
              <p className={`state-pill ${ticket.state}`}>{plainStatus(ticket.state)}</p>
            </div>
            {ticket.origin === "online" ? <div className="mono">{ticket.token}</div> : null}
            {commerce && formatPrice(ticket.priceCents) ? (
              <div className="dim">{formatPrice(ticket.priceCents)}</div>
            ) : null}
          </div>
        </div>

        {ticket.origin === "online" && !finished ? (
          <p className="help tight">When it is done, put it on the online shelf.</p>
        ) : null}

        {needsScan ? (
          <label className="field">
            <span>Scan the can</span>
            <input
              ref={barcodeRef}
              value={barcode}
              data-capture="hold"
              onChange={(event) => onBarcode(event.target.value)}
              placeholder="Scan here"
              aria-label="Can barcode"
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  onNext();
                }
              }}
            />
            <button type="button" className="skip wide" onClick={onUseSku}>
              This can is right
            </button>
          </label>
        ) : null}

        <div className="actions stacked">
          {finished ? (
            <p className="help tight">
              {ticket.origin === "online"
                ? `Staged · ${ticket.stageBin ?? "Online shelf"}.`
                : "Hand it to the customer."}
            </p>
          ) : (
            <button type="button" className="commit xl" disabled={busy} onClick={onNext}>
              {nextLabel}
            </button>
          )}
        </div>

        {!finished ? (
          <button type="button" className="more-link" onClick={() => setMore((open) => !open)}>
            {more ? "Hide extras" : "More"}
          </button>
        ) : null}
        {more && !finished ? (
          <div className="more-block">
            {recipe.length > 0 ? (
              <div className="recipe">
                <h3>What goes in</h3>
                <ul>
                  {recipe.map((line) => (
                    <li key={line}>{line.replace(" shots", "")}</li>
                  ))}
                </ul>
              </div>
            ) : null}
            <button type="button" className="skip wide" disabled={busy} onClick={onWrongCan}>
              Wrong can
            </button>
          </div>
        ) : null}
      </div>
    </section>
  );
}
